`use strict`;

import {
  exec,
  spawn,
} from 'child_process';

import {
  parse,
  basename,
} from 'path';

// IMPORTANT(jeff): We must require `dotenv/config` with the `-r` parameter
// to nodejs if we do not execute the following! The downside of doing this
// is that we also lose the ability to preset the environment on the same
// line as the direct run, i.e.: RC_VAR1=false node index.js
import dotenv from 'dotenv';

let useDotEnv = !!(process.env[`USE_DOTENV`]) || false;
if(useDotEnv == true) {
  dotenv.config(`.env`);
}

let DEFAULT_FILTERED_FILES = [
  `Thumbs.db`,
  `.DS_Store`,
   `._*`,
   `*un~*`,
];

let DEFAULT_FILTERED_DIRS = [
  `node_modules`
];

import {
  DEFAULT_FILE_OPTIONS,
  noop,
  assign,
  pathExists,
  pathExistsSync,
  readFile,
  readFileSync,
  where,
} from './src/utils.js';

function toBool(expr) {
  return !!(expr);
}

function parseBool(state, options) {}

let modeLogFileAppend = toBool(process.env[`RC_LOGFILE_APPEND`]) || false;
let useLogFile = false;

let modeLogFile = process.env[`RC_LOGFILE`] || ``;
if(modeLogFile.length > 0) {
  useLogFile = true;
}

let numThreads = parseInt(process.env[`RC_THREADS`],10) || 2;
let modeDry = toBool(process.env[`RC_DRY`]) || false;
let modeVerbose = toBool(process.env[`RC_VERBOSE`]) || false;
let modeDebug = toBool(process.env[`RC_DEBUG`]) || false;

import yargs from 'yargs';

function build_ignore_list(list) {
  let result = [];
  if(typeof list === `string`) {
    let element = list.split(`\n`);
    let noWordIdx = element.indexOf(``);
    element.splice(noWordIdx, 1);
    element.forEach((el) => {
      if(pathExistsSync(el) == true) {
        result.push(`/xd ${el}`);
      } else if(el && typeof el === `string`) {
        result.push(`/xf ${el}`);
      }
    });
  } else if(typeof list === `array`) {
    if(pathExistsSync(el) == true) {
      result.push(`/xd ${el}`);
    } else if(el && typeof el === `string`) {
      result.push(`/xf ${el}`);
    }
  }

  return result;
}

let DEFAULT_PARAMS = [
  `/copyall`, // requires root priv
  `/e`, // copy empty paths
  `/z`,
  `/XA:SH`, // attributes
  `/V`,
  `/NP`, // no progress; performance boost
  `/R:4`, // read tries
  `/W:2`, // write tries
  //`/MT:5`, // multi threads
  //`/LOG+:${process.env['RC_LOG_FILE']}`, // open log file in APPEND mode
];

let ARGS_SEPERATOR = process.env[`RC_ARGS_SEPERATOR`] ||
  `\n`;

let CRITICAL_ARRAY_EMPTY = (args) => {
  return `The parameter ${args} must be a non-empty array object.`;
};

function execute(cmd, params = []) {
  let args = assign([], params);

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
    console.error(output.toString());
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

function usage_help() {
  const SCRIPT_NAME = basename(process.argv[0]);
  console.log(`${SCRIPT_NAME} - a source and destination path must be given as your input.`);
}

function execute_robocopy(params = []) {
  let result = null;
  let cmd = params && params.length > 0 && params[0] ||
    `robocopy.exe`;

  let args = assign(DEFAULT_PARAMS, params);
  if(!args || args.length < 1) {
    const errMsg = CRITICAL_EMPTY_ARRAY(args);
    return console.error(errMsg);
  }
  
  result = execute(cmd, args);
  return(result);
}

async function main(argc = 0, argv = []) {
  const parsedFilterConfig = await readFileSync(`ignore.conf`);
  let filter = build_ignore_list(parsedFilterConfig);
  let args = [
    //`C:/Users/i8deg/Software`,
    //`D:/Software`,
    // `source:C:/Users/i8deg/Software`,
    // `dest:D:/Software`,
  ];
  args = [];

  if(argc < 1) {
    usage_help();
    return process.exit(0);
  }

  if(numThreads > 0) {
    args.push(`/MT:${numThreads}`);
  }

  // NOTE(jeff): First, let us do the optional arguments
  // parsing!
  if(argv.includes(`/mir`) == true) {
    args.push(`/MIR`);
  }

  if(argv.includes(`-n`) == true) {
    modeDry = true;
  }

  if(argv.includes(`dry`) == true) {
    modeDry = true;
  }

  if(argv.includes(`/opt`) == true) {
    args.push(`/OPT`);
  }

  if(useLogFile) {
    const logFileName = process.env[`RC_LOGFILE`];
    if(modeLogFileAppend == true) {
      // NOTE(jeff): Append to an existing log file
      args.push(`/LOG+:${logFileName}`);
    } else {
      // NOTE(jeff): Overwrite log file
      args.push(`/LOG:${logFileName}`);
    }
  } else {
    console.info(`Execution log file has been explicitly disabled.`);
  }

  filter.forEach((el) => {
    if(el) {
      args.push(el);
    }
  });

  argv.forEach((arg, idx) => {
    if(!arg) {
      return;
    }
    if(idx == 0) {
      return;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
    if(arg.includes("source:") == true) {
      let sourceStr = arg.substring(7,255);
console.debug(`source:${sourceStr}`);
      args.push(`${sourceStr}`);
    } else if(arg.includes("source:") == false) {
      console.error(`CRITICAL: A source path must be given.`);
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
    if(arg.includes("dest:")) {
      let destStr = arg.substring(5,255);
console.debug(`dest:${destStr}`);
      args.push(`${destStr}`);
    } else if(args.includes(`dest:`) == false) {
      console.error(`CRITICAL: A destination path must be given.`);
    }

  });

  execute_robocopy(args);
  process.exit(0);
}

// IMPORTANT(jeff): We are needing the right array count for **only** the end-user passed input
let args = [process.argv.shift(),process.argv];
let numArgs = args.length;
main(numArgs, args);
//main(process.argv.length, process.argv);
