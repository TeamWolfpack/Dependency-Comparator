#!/bin/bash

# start by making it supported on Mac
gulp supportMac

# tags will determine what kind of update we need (Major, Minor, Patch, Beta)
if [ "$TRAVIS_TAG" == "major" ]; then
	echo $TRAVIS_TAG + " should be major"
	if [ "$TRAVIS_BRANCH" == "dev" ]; then
		echo "in dev"
	fi
elif [ "$TRAVIS_TAG" == "minor" ]; then
	echo $TRAVIS_TAG + " should be minor"
	if [ "$TRAVIS_BRANCH" == "dev" ]; then
		echo "in dev"
	fi
elif [ "$TRAVIS_TAG" == "patch" ]; then
	echo $TRAVIS_TAG + " should be patch"
	if [ "$TRAVIS_BRANCH" == "dev" ]; then
		echo "in dev"
	fi
elif [ "$TRAVIS_TAG" == "beta" ]; then
	echo $TRAVIS_TAG + " should be beta"
	if [ "$TRAVIS_BRANCH" == "dev" ]; then
		echo "in dev"
	fi
fi
	
# what to do when the build and tests succeed on dev
if [ "$TRAVIS_BRANCH" == "dev" ]; then
	gulp
	#if [ "$TRAVIS_TAG"]; then
	#echo $TRAVIS_TAG
	#fi
	#gulp bumpBeta
	#gulp publish
	echo "ran in dev"
# what to do when the build and tests succeed on master
elif [ "$TRAVIS_BRANCH" == "master" ]; then
	gulp
	#gulp bumpMinor
	#gulp bumpMajor
	echo "ran in master"
fi
