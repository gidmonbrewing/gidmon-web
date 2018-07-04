# gidmon-web

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/)

## Installation

* Install Git
* Install Node.js
* `git clone <repository-url>` this repository
* `cd gidmon-web`
* `npm install` (install dependencies)

## Running / Development

* `ember serve [--proxy http://127.0.0.1:8000]`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build [--output-path=..\gidmon-web-dist\dist] [--environment=production]`

### Deploying

* `ember build --output-path=..\gidmon-web-dist\dist --environment=production`
* Commit gidmon-web-dist
* Pull down on server

## Update Ember and related packages

* `npm outdated` (show packages that are not on the latest version)
* `npm cache clean` (cleaned caches npm)
* `npm install -g ember-cli@latest` (install latest ember-cli)
* `npm show ember-cli version` (show installed version)
* `npm install --save-dev ember-cli@2.16.2 (install npm dependent packages and save latest ember-cli as a dependency, assuming 2.16.2 was the latest installed version)
* `ember install ember-power-select`
* `ember install ember-uploader`
* `ember init` (update project blueprint, be careful about not overwriting changes you need)

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
