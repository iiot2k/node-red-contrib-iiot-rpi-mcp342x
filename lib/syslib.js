/**
 * Copyright 2022 Ocean (iiot2k@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use node file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

"use strict";

const fs = require('fs');

module.exports.outError = function (node, errShort, errLong) {
	if (node.save_txt === errShort)
		return true;

	node.save_txt = errShort;
	node.status({ fill: "red", shape: "ring", text: errShort });
	node.error(errLong);

	return true;
}

module.exports.outText = function (node, txt) {
	if (node.save_txt === txt)
		return;

	node.save_txt = txt;
	node.status({ fill: "blue", shape: "ring", text: txt });
}

module.exports.checkParameter = function (node) {
	switch(node.devtype)
	{
		case 1: // mcp3421 1-channel, 12bit-18bit, one I2C address
			if ((node.channel > 0) || (node.devadr > 0))
				return false;
			break;
		case 2: // mcp3422 2-channel, 12bit-18bit, one I2C address
			if ((node.channel > 1) || (node.devadr > 0))
				return false;
			break;
		case 3: // mcp3423 2-channel, 12bit-18bit, eight I2C addresses
			if (node.channel > 1)
				return false;
			break;
		case 4: // mcp3424 4-channel, 12bit-18bit, eight I2C addresses
			break;
		case 5: // mcp3425 1-channel, 12bit-16bit, one I2C address
			if ((node.channel > 0) || (node.mode > 2) || (node.devadr > 0))
				return false;
			break;
		case 6: // mcp3426 2-channel, 12bit-16bit, one I2C address
			if ((node.channel > 1) || (node.mode > 2) || (node.devadr > 0))
				return false;
			break;
		case 7: // mcp3427 2-channel, 12bit-16bit, eight I2C addresses
			if ((node.channel > 1) || (node.mode > 2))
				return false;
			break;
		case 8: // mcp3428 4-channel, 12bit-16bit, eight I2C addresses
			if (node.node.mode > 2)
				return false;
			break;
	}

	return true;
}

module.exports.getChannel = function (node) {
	switch(node.devtype)
	{
		case 1: // mcp3421 1-channel, 12bit-18bit, one I2C address
		case 5: // mcp3425 1-channel, 12bit-16bit, one I2C address
			return 1;
		case 2: // mcp3422 2-channel, 12bit-18bit, one I2C address
		case 3: // mcp3423 2-channel, 12bit-18bit, eight I2C addresses
		case 6: // mcp3426 2-channel, 12bit-16bit, one I2C address
		case 7: // mcp3427 2-channel, 12bit-16bit, eight I2C addresses
			return 2;
		case 4: // mcp3424 4-channel, 12bit-18bit, eight I2C addresses
		case 8: // mcp3428 4-channel, 12bit-16bit, eight I2C addresses
			return 4;
	}

	return true;
}

function getRpiTarget()
{
	if (process.platform !== 'linux')
		return undefined;
	
	var cpuinfo = fs.readFileSync("/proc/cpuinfo").toString();

	if (cpuinfo.indexOf(": BCM") === -1)
		return undefined;
	
	if (process.arch === "arm64")
		return "_s64.node";
	else if (process.arch === "arm")
		return "_s32.node";
	
	return undefined;
}

module.exports.LoadModule = function (module) {
	try {
		var modName = getRpiTarget();
		if (modName !== undefined)
			return require("./" + module + modName);
	}
	catch (e) { console.log(e); }
	return undefined;
}
