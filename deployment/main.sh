#!/usr/bin/bash

set -e


# Determine OS platform
UNAME=$(uname | tr "[:upper:]" "[:lower:]")
# If Linux, try to determine specific distribution
if [ "$UNAME" == "linux" ]; then
    # If available, use LSB to identify distribution
    if [ -f /etc/lsb-release -o -d /etc/lsb-release.d ]; then
        export DISTRO=$(lsb_release -i | cut -d: -f2 | sed s/'^\t'//)
    # Otherwise, use release info file
    else
        export DISTRO=$(ls -d /etc/[A-Za-z]*[_-][rv]e[lr]* | grep -v "lsb" | cut -d'/' -f3 | cut -d'-' -f1 | cut -d'_' -f1)
    fi
fi

if ["$DISTRO" == "Raspbian"]; then
    apt-get update
    apt-get install python3 python3-pip
    python3 -m pip install ansible
fi

export ANSIBLE_HOSTS_KEY_CHECKING=False

ansible-playbook -i ansible_configs/hosts.yml ansible_configs/main.yml
