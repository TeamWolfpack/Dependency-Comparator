#!/bin/bash

# start by making it supported on Mac
gulp supportMac

# tags will determine what kind of update we need (Major, Minor, Patch, Beta)
if [ "$TRAVIS_TAG" == "major" ]; then
	gulp bumpMajor
elif [ "$TRAVIS_TAG" == "minor" ]; then
	gulp bumpMinor
elif [ "$TRAVIS_TAG" == "patch" ]; then
	gulp bumpPatch
elif [ "$TRAVIS_TAG" == "beta" ]; then
	gulp bumpBeta
fi

# will push with another tag so that travis can deploy. This will help avoid deploying code that breaks our tests
eval "$(ssh-agent -s)" #start the ssh agent
chmod 600 .travis/deploy_key.pem # this key should have push access
ssh-add .travis/deploy_key.pem
# git remote add deploy DEPLOY_REPO_URI_GOES_HERE
git remote add deploy git@github.com:TeamWolfpack/Dependency-Comparator.git
git tag "deploy" -f
git push --tags -f
