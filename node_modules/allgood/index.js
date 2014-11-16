module.exports = {
	valid: function(schema, json) {
		if (!Object.keys(json)) {
			return false;
		}
	 	if (allKeysPresent(schema, json) && allCorrectKeyValues(schema, json)) {
	 		return true;
	 	} else {
	 		return false
	 	}
	},

	problems: function(schema, json) {
		var missing = missingKeys(schema, json);
		var incorrect = incorrectKeyValues(schema, json);
		var message = [];
		if (missing.length > 0) {
			message.push("Missing keys: [" + missing.join(", ") + ']');
		}
		if (incorrect.length > 0) {
			message.push("Incorrect values for keys: [" + incorrect.join(", ") + ']');
		}
		return message.join(", ");
	}
};

// return false as soon as an incorrect value is found

function allKeysPresent(schema, json) {
	var anyMissing = Object.keys(schema).some(function(key) {
		return !json.hasOwnProperty(key);
	});
	return !anyMissing;
}

function allCorrectKeyValues(schema, json) {
	var anyWrongTypes = Object.keys(schema).some(function(key) {
		return !(typeof(json[key]) == schema[key]);
	});
	return !anyWrongTypes;
}

// slower functions to return an array of errors

function missingKeys(schema, json) {
	missing = [];
	var keys = Object.keys(schema);
	for (var i=0; i < keys.length; i++) {
		if (!json.hasOwnProperty(keys[i])) {
			missing.push(keys[i]);
		}
	}
	return missing;
}

function incorrectKeyValues(schema, json) {
	incorrect = [];
	var keys = Object.keys(schema);
	for (var i=0; i < keys.length; i++) {
		if (!(typeof(json[keys[i]]) == schema[keys[i]])) {
			incorrect.push(keys[i]);
		}
	}
	return incorrect;
}