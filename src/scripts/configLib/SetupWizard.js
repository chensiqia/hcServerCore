/**
  * Server setup wizard, quick server setup and all that jazz. . .
  *
  * Version: v2.0.0
  * Developer: Marzavec ( https://github.com/marzavec )
  * License: WTFPL ( http://www.wtfpl.net/txt/copying/ )
  *
  */

const fse = require('fs-extra');
const prompt = require('prompt');
const path = require('path');

class SetupWizard {
  /**
    * Create a `SetupWizard` instance for initializing the server's config.json
    *
    * @param {Object} serverConfig reference to the server config class
    */
  constructor (serverConfig) {
    this.serverConfig = serverConfig;
  }

  /**
    * Roll a d20 and begin the wizarding process
    *
    */
  async start () {
    // load the current config to use as defaults, if available
    let currentConfig = await this.serverConfig.load() || {};

    // load the setup questions & set their defaults
    let questions = require('../setupSchema/Questions.js');
    questions.properties = this.setQuestionDefaults(questions.properties, currentConfig);

    // output the packages setup banner
    require('../setupSchema/Banner.js');

    // let's start playing 20 questions
    prompt.start();
    prompt.get(questions, (err, result) => this.finalize(err, result));
  }

  /**
    * Compares the currently loaded config with the stock questions, adds a default
    * and required option to the question
    *
    * @param {Object} questions the set of questions from /setupSchema
    * @param {Object} currentConfig the current server options
    */
  setQuestionDefaults (questions, currentConfig) {
    Object.keys(questions).forEach(qName => {
      if (typeof currentConfig[qName] !== 'undefined') {
        questions[qName].default = currentConfig[qName];
        questions[qName].required = false;
      } else {
        questions[qName].required = true;
      }
    });

    return questions;
  }

  /**
    * Looks like all the questions have been answered, check for errors or save
    * the new config file
    *
    * @param {Object} err any errors generated by Prompt
    * @param {Object} result the answers / new config setup
    */
  async finalize (err, result) {
    // output errors and die if needed
    if (err) {
      console.error(err);
      process.exit(0);
    }

    // finally create the actual JSON file
    try {
      this.serverConfig.config = result;
      await this.serverConfig.save();
    } catch (e) {
      console.error(`Couldn't write config to ${this.serverConfig.configPath}
        ${e.stack}`);
    }

    // output the packages final notice before quitting
    require('../setupSchema/Footer.js');

    process.exit(0);
  }
}

module.exports = SetupWizard;
