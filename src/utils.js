`use strict`;

import fs from 'fs';
import {parse} from 'path';

export
const DEFAULT_FILE_OPTIONS = {
  // encoding: null
};

export
function noop() {
  return;
}

export
function assign(target, source, ...args) {
  let result = Object.assign(target, source, args);
  return(result);
}

export
function pathExists(path, callback = noop) {
  return fs.exists((err, result) => {
    if(err) {
      console.error(err);
      return(err);
    }

    if(result) {
      return callback(result);
    }
  });
}

export
function pathExistsSync(path) {
  let result = false;
  result = fs.existsSync(path);
  return(!!result);
}

export
async function readFileSync(path, params) {
  let result = null;
  let options = assign(DEFAULT_FILE_OPTIONS, params);

  result = await fs.readFileSync(path, options);
  return(result.toString());
}

export
function readFile(path, params, callback = noop) {
  let result = null;
  let options = assign(DEFAULT_FILE_OPTIONS, params);
  return fs.readFile(path, (err, results) => {
    if(err) {
      console.error(err);

      if(callback) {
        return callback(err, null);
      }
    }

    if(results) {
      return callback(null, results.toString());
    }
  });
}

export
  function where(path, ...args) {
  const cmd = `C:/Windows/System32/where.exe`;
  let result = false;
  //let args = [];

  if(path && path != ``) {
    args.push(path);
  }

  result = execute(cmd, args);

  return(!!result);
}

const api = {
  DEFAULT_FILE_OPTIONS,
  noop,
  assign,
  pathExists,
  readFileSync,
  readFile
    // where,
}
