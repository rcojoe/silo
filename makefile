# Meta
.PHONY: build

# Variables
CD=$(shell pwd)

#
# Standard targets
#
help:
	@echo "Please visit github.com/frankandoak/silo for help"

build:
	composer install
	npm install
	node node_modules/.bin/webpack --config webpack.config.js

clean:
	rm -rf vendor
	rm -rf node_modules

mrproper: clean

test: reports
	rm -rf reports/*
	php vendor/behat/behat/bin/behat -f progress,junit --out ,reports

release.zip:
	zip release.zip bin client features less public server vendor composer.json composer.lock gulpfile.js LICENSE makefile package.json README.md

#
# Sub targets
#
reports:
	mkdir reports
