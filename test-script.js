var eslint = require('eslint');

var SourceCode = eslint.SourceCode;
var CLIEngine = eslint.CLIEngine;
var test = require('tape');
var tapSpec = require('tap-spec');

test.createStream().pipe(tapSpec()).pipe(process.stdout);

var fs = require('fs');
var path = require('path');

var goodFilesPath = path.join(__dirname, 'tests', 'good');
var goodFiles = fs.readdirSync(goodFilesPath);

var badFilesPath = path.join(__dirname, 'tests', 'bad');
var badFiles = fs.readdirSync(badFilesPath);

var regex = new RegExp('^//\\s*([a-z-]+)\\s+line:\\s*(\\d+)\\s+column:\\s*(\\d+)\\s*$');
function extractExpectedErrors(code) {
	var lines = code.split(/\n/);

	var result = [];

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		line = line.replace(/\r/, '');

		var matches = line.match(regex);

		if (matches == null) {
			continue;
		}

		result.push({
			ruleId: matches[1],
			line: parseInt(matches[2], 10),
			column: parseInt(matches[3], 10),
		});
	}

	return result;
}

for (var i in goodFiles) {
	(function(i) {
		var goodFile = goodFiles[i];

		test('good: ' + goodFile, function(t) {
			var code = fs.readFileSync(path.join(goodFilesPath, goodFile), 'utf-8');

			var linter = new CLIEngine({
				configFile: path.join(__dirname, 'config.json'),
			});
			var result = linter.executeOnText(code);

			var errors = result.results[0].messages;

			if (errors.length === 0) {
				t.pass('Found no errors');
			} else {
				t.fail(
					'Errors found: ' +
					JSON.stringify(result.results[0].messages, undefined, 2)
				);
			}
			t.end();
		});
	})(i);
}

for (var i in badFiles) {
	(function(i) {
		var badFile = badFiles[i];

		test('bad: ' + badFile, function(t) {
			t.plan(1);
			var code = fs.readFileSync(path.join(badFilesPath, badFile), 'utf-8');
			var linter = new CLIEngine({
				configFile: path.join(__dirname, 'config.json'),
			});

			var result = linter.executeOnText(code);

			var errors = result.results[0].messages;
			var expectedErrors = extractExpectedErrors(code);

			if (expectedErrors.length === 0) {
				t.fail(
					'No expected errors found in test file. Errors are: ' +
					JSON.stringify(errors, undefined, 2)
				);
				return;
			}

			for (var j in expectedErrors) {
				var found = false;
				var expected = expectedErrors[j];
				for (var n in errors) {
					var error = errors[n];
					if (
						expected.ruleId === error.ruleId &&
						expected.line === error.line &&
						expected.column === error.column
					) {
						found = true;
						break;
					}
				}

				if (!found) {
					t.fail(
						'Expected to find error ' +
						expected.ruleId +
						' at ' +
						expected.line +
						':' +
						expected.column +
						' but didn\'t. I found these errors: ' +
						JSON.stringify(errors, undefined, 2)
					);
					return;
				}
			}

			if (expectedErrors.length === errors.length) {
				t.pass('Found all errors expected');
				return;
			}

			t.fail(
				'There are more errors than expected. The errors are: ' +
				JSON.stringify(errors, undefined, 2)
			);
		});
	})(i);
}
