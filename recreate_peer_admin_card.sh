#!/bin/bash

cd ../fabric-dev-servers
./stopFabric.sh
./teardownFabric.sh
./startFabric.sh
./createPeerAdminCard.sh
