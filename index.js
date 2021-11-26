`use strict`;

import {
  exec,
  spawn,
} from 'child_process';

import fs from 'fs';
import {parse} from 'path';

// IMPORTANT(jeff): We must require `dotenv/config` with the `-r` parameter
// to nodejs if we do not execute the following!
import dotenv from 'dotenv';
dotenv.config();

let DEFAULT_FILTERED_FILES = [
  `Thumbs.db`,
  `.DS_Store`,
   `._*`,
   `*un~*`,
];

let DEFAULT_FILTERED_DIRS = [
  `node_modules`
];

function noop() {
  return;
}

let modeDry = process.env[`ROBOCOPY_DRY`] || false;
let modeVerbose = process.env[`ROBOCOPY_VERBOSE`] || false;
let modeDebug = process.env[`ROBOCOPY_DEBUG`] || false;

import yargs from 'yargs';

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

async function pathExistsSync(path) {
  let result = false;
  result = await fs.existsSync(path);
  return(!!result);
}

let DEFAULT_FILE_OPTIONS = {
  encoding: `utf8`,
};

async function readFileSync(path, params) {
  let result = null;
  let options = Object.assign(DEFAULT_FILE_OPTIONS, params);
  
  result = await fs.readFileSync(path, options);
  return(result);
}

function readFile(path, params, callback = noop) {
  let result = null;
  let options = Object.assign(DEFAULT_FILE_OPTIONS, params);
  return fs.readFile(path, (err, results) => {
    if(err) {
      console.error(err);

      if(callback) {
        return callback(err, null);
      }
    }

    if(results) {
      return callback(null, results);
    }
  });
}

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

function build_file_list(list) {
  let result = [];
  list.forEach((el) => {
    if(el) {
      result.push(`/xf ${el}`);
    }
  });

  return result;
}

function build_dir_list(list) {
  let result = [];
  list.forEach((el) => {
    if(el) {
      result.push(`/xd ${el}`);
    }
  });

  return result;
}

let DEFAULT_PARAMS = [
  `/copyall`,
  `/e`, // copy empty paths
  `/z`,
  `/XA:SH`, // attributes
  `/V`,
  `/NP`, // no progress
  `/R:4`, // read tries
  `/W:2`, // write tries
  `/MT:5`, // multi threads
  `/LOG+:${process.env['LOG_FILE']}`, // open log file in APPEND mode
];

let ARGS_SEPERATOR = process.env[`ROBOCOPY_ARGS_SEPERATOR`] || 
  `\n`;

let CRITICAL_ARRAY_EMPTY = (args) => {
  return `The parameter ${args} must be a non-empty array object.`;
};

function execute(cmd, params = []) {
  let args = Object.assign([], params);

  if(modeDry) {
    console.debug(`${cmd} ${args.join(ARGS_SEPERATOR)}`);
  }

  const bat = spawn(cmd, args);
  bat.stdout.on(`data`, (output) => {
    if(output) {
      console.log(`spawn output: ${output.toString()}`);
    }
  });

  bat.stderr.on(`data`, (output) => {
    console.error(ouitput.toString());
  });

  bat.on(`exit`, (code) => {
    let exitCode = code || -255;
    console.debug(`The process has exited with the status code of ${exitCode}.`);
  });

  if(args.length < 1) {
    return args;
  }
  
  return args.join(ARGS_SEPERATOR);
}

function execute_robocopy(params = [], files_filter = [], dirs_filter = []) {
  let result = null;
  let cmd = params && params.length > 0 && params[0] || 
    `robocopy.exe`;

  let args = Object.assign(DEFAULT_PARAMS, params);
  if(!args || args.length < 1) {
    const errMsg = CRITICAL_EMPTY_ARRAY(args);
    return console.error(errMsg);
  }

  let pIdx = 0;
  let pIdxValid = 0;
  args.forEach((el, idx, arr) => {
    pIdx = idx;
    if(el) {
      let p = parse(el);
      if(p != null) {
        pIdxValid = (pIdxValid + 1);
      }
    }

    pIdx = idx;
  });

  if(pIdxValid < 2) {
    console.error(`A source and destination path must be given.\n\n${pIdxValid}\n${pIdx}`);
    return;
  }

  DEFAULT_PARAMS.forEach((el) => {
    if(el) {
      args.push(el);
    }

  });

  if(files_filter && files_filter.length > 0) {
    files_filter.forEach((el) => {
      if(el) {
        args.push(el);
      }
    });
  }

  if(dirs_filter && dirs_filter.length > 0) {
    dirs_filter.forEach((el) => {
      if(el) {
        args.push(el);
      }
    });
  }

  result = execute(cmd, args);
  return(result);
}

async function main(argc = 0, argv = []) {
  let files_filter = build_file_list(DEFAULT_FILTERED_FILES);
  let dirs_filter = build_dir_list(DEFAULT_FILTERED_DIRS);

  let args = [
    `C:/Users/i8deg/Software`,
    `D:/Software`,
    // `source:C:/Users/i8deg/Software`,
    // `dest:D:/Software`,
  ];
  args = [];

  console.debug(await readFileSync(`./dirs_ignore.conf`));
  console.debug(await readFileSync(`./files_ignore.conf`));
  
  process.argv.forEach((el, idx) => {
    if(!el) {
      return;
    }

    if(idx < 2) {
      return;
    }

    // NOTE(jeff): First, let us do the optional arguments 
    // parsing!
    if(el.includes(`/mir`) == true) {
      args.push(`/MIR`);
    } else if(el.includes(`/MIR`) == true) {
      args.push(`/MIR`);
    } 
    
    if(el.includes("source:") == true) {
      let sourceStr = el.substring(7,255);
console.debug(`source:${sourceStr}`);
      args.push(`${sourceStr}`);
    } else if(el.includes("source:") == false) {
      console.error(`CRITICAL: A source path must be given.`);
      //process.exit(1);
    }

    if(el.includes("dest:")) {
      let destStr = el.substring(5,255);
console.debug(`dest:${destStr}`);
      args.push(`${destStr}`);
    } else {
      console.error(`CRITICAL: A destination path must be given.`);
      //process.exit(1);
    }
  });

  let output = execute_robocopy(args, files_filter, dirs_filter);
  if(modeVerbose == true || modeDebug == true) {
    console.info(output);
  }
  process.exit(0);
}

main(process.argv.length, process.argv);
