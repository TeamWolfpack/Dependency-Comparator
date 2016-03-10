#!/bin/bash
if [ "$TRAVIS_BRANCH" == "dev" ]; then
	gulp
	echo "ran in dev"
if [ "$TRAVIS_BRANCH" == "master" ]; then
	gulp
	echo "ran in master"
fi
