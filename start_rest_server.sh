#!/bin/bash

echo "start rest server"
composer archive create -t dir -n .
composer network install --card PeerAdmin@hlfv1 --archiveFile my-block-chain@0.3.12.bna
composer network start --networkName my-block-chain --networkVersion 0.3.12 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
