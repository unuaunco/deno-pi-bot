#!/usr/bin/bash

set -e

# Determine OS platform
UNAME=$(uname | tr "[:upper:]" "[:lower:]")
# If Linux, try to determine specific distribution
if [ "$UNAME" == "linux" ]; then
    export DISTRO=$(lsb_release -i | cut -d: -f2 | sed s/'^\t'//)

    if [[ "$DISTRO" == "Raspbian" ]]; then
        apt-get update
        apt-get install -y python3 python3-pip
        python3 -m pip install ansible
    elif [[ "$DISTRO" == "Ubuntu" ]]; then
        apt-get update
        apt-get -y install \
            gcc g++ make wget tar gzip zlib1g-dev libbz2-dev \
            libssl-dev uuid-dev libffi-dev libreadline-dev \
            libsqlite3-dev tk-dev libbz2-dev libncurses5-dev \
            libreadline6-dev libgdbm-dev liblzma-dev \
            libgdbm-compat-dev
    fi

    export PYTHON_INTERPRETER_PATH=/usr/local/bin/python3.9

    if  [[ ! -f $PYTHON_INTERPRETER_PATH ]]; then
        wget --no-check-certificate https://www.python.org/ftp/python/3.9.4/Python-3.9.4.tgz
        tar -xvf Python-3.9.4.tgz
        cd Python-3.9.4
        ./configure --prefix=/usr/local
        make -j$(nproc) && make install
        $PYTHON_INTERPRETER_PATH -m pip install -U pip
        $PYTHON_INTERPRETER_PATH -m pip install -U virtualenv
        
        if [[ "$DISTRO" == "Ubuntu" ]]; then
            apt-get -y install -U python3-apt
        fi
    fi
fi

$PYTHON_INTERPRETER_PATH -m pip install ansible==2.10.7


export ANSIBLE_HOSTS_KEY_CHECKING=False

ansible-playbook -i ansible_configs/hosts.yml ansible_configs/main.yml
