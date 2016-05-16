#!/bin/bash

# start by making it supported on Mac
gulp supportMac

# tags will determine what kind of update we need (Major, Minor, Patch, Beta)
if [[ "$TRAVIS_TAG" == *"major"* ]]; then
	gulp bumpMajor
elif [[ "$TRAVIS_TAG" == *"minor"* ]]; then
	gulp bumpMinor
elif [[ "$TRAVIS_TAG" == *"patch"* ]]; then
	gulp bumpPatch
elif [[ "$TRAVIS_TAG" == *"beta"* ]]; then
	gulp bumpBeta
fi
