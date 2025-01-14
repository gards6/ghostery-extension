/**
 * BugDb.js Unit Tests
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import _ from 'underscore';
import bugDb from '../../src/classes/BugDb';
import conf from '../../src/classes/Conf';
import globals from '../../src/classes/Globals';
import { prefsGet } from '../../src/utils/common';

describe('src/classes/BugDb.js', () => {
	describe('pre-init tests', () => {
		test('Type gets set from its parent', () => {
			return expect(bugDb.type).toBe('bugs');
		});
	});

	describe('post-init tests', () => {
		let all_app_ids,
			bugs = {
				"apps": {
					"3": {
						"name": "Clicky",
						"cat": "site_analytics",
						"trackerID": "clicky"
					},
					"5": {
						"name": "Statisfy",
						"cat": "site_analytics",
						"trackerID": "statisfy"
					},
					"6": {
						"name": "Google Widgets",
						"cat": "customer_interaction",
						"trackerID": "google_widgets",
					},
					"8": {
						"name": "Twitter Badge",
						"cat": "social_media",
						"trackerID": "twitter_badge",
						"tags": [
							39
						]
					}
				},
				"bugs": {
					"2": {
						"aid": 13
					},
					"3": {
						"aid": 15
					},
					"4": {
						"aid": 16
					},
					"6": {
						"aid": 17
					}
				},
				"patterns": {
					"host": {
						"gr": {
							"adman": {
								"$": 1688
							},
							"in": {
								"adman": {
									"$": 1689
								}
							},
							"ad4mat": {
								"$": 2139
							}
						}
					},
					"host_path": {
						"ua": {
							"at": {
								"$": [
									{
										"path": "stat/",
										"id": 1066
									}
								]
							}
						}
					},
					"path": {
						"clicky.js": 2780,
						"foresee-analytics": 464,
						"foreSee/foresee-alive.js": 3557
					},
					"regex": {
						"26": "(\\.feedburner\\.com\\/~f|feedproxy\\.google\\.com\\/~fc\\/)",
						"32": "\\/woopra(\\.v(2|3|4))?\\.js",
						"64": "\\.google\\.com(...)?\\/coop\\/cse\\/brand"
					}
				},
				"version":416
			};

		beforeAll(done => {
			// Fake XMLHttpRequest for fetchJson(/databases/bugs.json)
			global.mockFetchResponse(200, JSON.stringify(bugs));

			chrome.storage.local.get.yields({ previousVersion: "8.0.8" });
			conf.init().then(() => {
				bugDb.init().then(() => {
					all_app_ids = _.keys(bugDb.db.apps);
					done();
				});
			}).catch(err => console.log(err));
		});

		describe('bugDb.db.[key] should not be empty', () => {
			test('bugs', () => expect(_.size(bugDb.db.bugs)).toBeGreaterThan(0));
			test('apps', () => expect(_.size(bugDb.db.apps)).toBeGreaterThan(0));
			test('patterns.host', () => expect(_.size(bugDb.db.patterns.host)).toBeGreaterThan(0));
			test('patterns.host_path', () => expect(_.size(bugDb.db.patterns.host_path)).toBeGreaterThan(0));
			test('patterns.path', () => expect(_.size(bugDb.db.patterns.path)).toBeGreaterThan(0));
			test('patterns.regex', () => expect(_.size(bugDb.db.patterns.regex)).toBeGreaterThan(0));

			test('...and all_app_ids has the correct size', () => expect(_.size(bugDb.db.apps)).toBe(all_app_ids.length));
		});

		describe('regexes should be correctly initialized', () => {
			let regexes, stored_regex_strings;

			beforeAll(done => {
				chrome.storage.local.get.withArgs(['patterns']).yields(bugs);
				regexes = bugDb.db.patterns.regex;
				prefsGet('patterns').then(result => {
					stored_regex_strings = result.regex;
					done();
				});
			});

			test('regex objects should not be objects should not be the same', () => {
				return expect(regexes).not.toBe(stored_regex_strings);
			});

			test('regex object should not be empty', () => {
				return expect(_.size(regexes)).toBeGreaterThan(0);
			});

			test('saved regexes are not empty objects', () => {
				// If this fails it will only fail once
				_.each(regexes, (regex, bug_id) => {
					expect(stored_regex_strings[bug_id]).not.toEqual({});
				});
				return;
			});

			test('saved regexes have a type of regex', () => {
				// If this fails it will only fail once
				_.each(regexes, (regex, bug_id) => {
					expect(regex instanceof RegExp).toBeTruthy();
				});
				return;
			});

			test('saved regexes match stored values', () => {
				// If this fails it will only fail once
				_.each(regexes, (regex, bug_id) => {
					expect(regex.toString()).toBe(`/${stored_regex_strings[bug_id]}/i`);
				});
				return;
			});
		});

		describe('re-initialization tests', () => {
			describe('bugsDb gets initialized with no apps selected', () => {
				beforeAll(done => {
					conf.selected_app_ids = {};
					bugDb.init().then(() => {
						done();
					});
				});

				test('db.allSelected', () => expect(bugDb.db.allSelected).toBeFalsy());
				test('db.noneSelected', () => expect(bugDb.db.noneSelected).toBeTruthy());
			});

			describe('bugsDb gets initialized with some apps selected', () => {
				beforeAll(done => {
					conf.selected_app_ids[Object.keys(bugDb.db.apps)[0]] = 1;
					bugDb.init().then(() => {
						done();
					});
				});

				test('db.allSelected', () => expect(bugDb.db.allSelected).toBeFalsy());
				test('db.noneSelected', () => expect(bugDb.db.noneSelected).toBeFalsy());
			});

			describe('bugsDb gets initialized with all apps selected', () => {
				beforeAll(done => {
					conf.selected_app_ids = {};
					conf.selected_app_ids = all_app_ids.reduce((memo, app_id) => {
						memo[app_id] = 1;
						return memo;
					}, {});

					bugDb.init().then(() => {
						done();
					});
				});

				test('db.allSelected', () => expect(bugDb.db.allSelected).toBeTruthy());
				test('db.noneSelected', () => expect(bugDb.db.noneSelected).toBeFalsy());
			});
		});

		describe('test initialized values', () => {
			beforeAll(() => {
				conf.selected_app_ids = {};
			});

			test('JUST_UPDATED_WITH_NEW_TRACKERS is not set by default', () => {
				return expect(bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS).toBeFalsy();
			});

			test('just_upgraded is false', () => {
				return expect(bugDb.just_upgraded).toBeFalsy();
			});

			test('newAppIds is not set by default', () => {
				prefsGet('newAppIds').then(result => {
					return expect(result).toBeNull();
				});
			});

			test('nothing is selected for blocking', () => {
				return expect(_.keys(conf.selected_app_ids).length).toBe(0);
			});

			[false, true].forEach(startWithAllTrackersBlocked => {
				describe(`test re-initialized values (startWithAllTrackersBlocked=${startWithAllTrackersBlocked}))`, () => {
					let new_app_ids;

					beforeAll(done => {
						conf.selected_app_ids = {};

						if (startWithAllTrackersBlocked) {
							conf.selected_app_ids = all_app_ids.reduce((memo, app_id) => {
								memo[app_id] = 1;
								return memo;
							}, {});
						}

						releaseNewSiteAnalyticsTracker(bugDb).then(result => {
							new_app_ids = result;
							done();
						});
					});

					test('JUST_UPDATED_WITH_NEW_TRACKERS is now set to true', () => {
						return expect(bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS).toBeTruthy();
					});

					test('newAppIds is now set', () => {
						return expect(new_app_ids).not.toBeNull();
					});

					test('just_upgraded is true', () => {
						return expect(bugDb.just_upgraded).toBeTruthy();
					});

					if (startWithAllTrackersBlocked) {
						test('the new Site Analytics tracker should be blocked like all the existing ones', () => {
							return expect(_.keys(conf.selected_app_ids).map(Number)).toEqual(new_app_ids);
						});
					} else {
						test('the new Site Analytics tracker should not be blocked, as the others in the category were also not blocked', () => {
							return expect(_.keys(conf.selected_app_ids).map(Number)).toEqual([]);
						});
					}

					function releaseNewSiteAnalyticsTracker(bugDb) {
						// fake an older bugs object
						const old_bugs = Object.assign({}, bugs);
						old_bugs.apps = Object.assign({}, old_bugs.apps);

						// by decrementing version
						old_bugs.version--;

						const new_bugs = Object.assign({}, bugs);
						new_bugs.apps = Object.assign({}, new_bugs.apps);

						// simulate that one additional site_analytics trackers came with the new version
						const new_tracker_id = '1000';
						expect(new_bugs.apps).not.toHaveProperty(new_tracker_id);
						new_bugs.apps[new_tracker_id] = {
							name: 'New Tracker',
							cat: 'site_analytics',
						};
						const new_app_ids = _.keys(new_bugs.apps);

						// update Conf
						conf.bugs = old_bugs;

						// Fake the xhr request again
						global.mockFetchResponse(200, JSON.stringify(new_bugs));

						// fake an upgrade so that we read the "newer" bugs from disk instead of localStorage
						return bugDb.init(true).then(() => {
							// newAppIds are integers
							return new_app_ids.map(Number);
						});
					};
				});
			});
		});
	});
});
