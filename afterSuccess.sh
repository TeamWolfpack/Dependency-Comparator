#!/bin/bash

# start by making it supported on Mac
gulp supportMac

# tsting tag stuff
if [ "$TRAVIS_TAG" == "tag_test" ]; then
	echo $TRAVIS_TAG
fi
	
# what to do when the build and tests succeed on dev
if [ "$TRAVIS_BRANCH" == "dev" ]; then
	gulp
	#if [ "$TRAVIS_TAG"]; then
	echo $TRAVIS_TAG
	#fi
	#gulp bumpPatchBeta
	#gulp publish
	echo "ran in dev"
# what to do when the build and tests succeed on master
elif [ "$TRAVIS_BRANCH" == "master" ]; then
	gulp
	#gulp bumpMinor
	#gulp bumpMajor
	echo "ran in master"
fi
