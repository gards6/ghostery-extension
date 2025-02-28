/**
 * Ghostery Common Import Class
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/*  @memberOf  BackgroundClasses */
import { parseHtml } from 'ghostery-common/build/gbe/human-web/html-helpers';
import CLIQZ from 'ghostery-common';
import { DOMParser } from 'linkedom';
import globals from './Globals';

if (!navigator.userAgent.includes('Firefox')) {
	parseHtml.domParser = new DOMParser();
}

const IS_ANDROID = globals.BROWSER_INFO.os === 'android';
export const HUMANWEB_MODULE = IS_ANDROID ? 'human-web-lite' : 'human-web';
export const HPN_MODULE = IS_ANDROID ? 'hpn-lite' : 'hpnv2';

// Override the default prefs based on the platform
CLIQZ.config.default_prefs = {
	...CLIQZ.config.default_prefs,
	cliqz_adb_mode: globals.DEFAULT_ADBLOCKER_MODE,
	// the following are enabled by default on non-android platforms
	'modules.human-web.enabled': !IS_ANDROID,
	'modules.hpnv2.enabled': !IS_ANDROID,
	// the following are enabled for android only
	'modules.human-web-lite.enabled': IS_ANDROID,
	'modules.hpn-lite.enabled': IS_ANDROID,
	'modules.anolysis.enabled': IS_ANDROID,
};
if (IS_ANDROID) {
	CLIQZ.config.settings.HW_CHANNEL = 'android';
}

export default new (CLIQZ.App)({ debug: globals.DEBUG });
