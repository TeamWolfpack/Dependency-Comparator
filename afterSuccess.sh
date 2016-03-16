#!/bin/bash

# start by making it supported on Mac
gulp supportMac

# what to do when the build and tests succeed on dev
if [ "$TRAVIS_BRANCH" == "dev" ]; then
	gulp
	echo "ran in dev"
# what to do when the build and tests succeed on master
elif [ "$TRAVIS_BRANCH" == "master" ]; then
	gulp
	echo "ran in master"
fi
