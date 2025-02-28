/**
 * Account Action creators
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

import { sendMessageInPromise } from '../panel/utils/msg';
import { log } from '../../src/utils/common';
import {
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT_SUCCESS,
	LOGOUT_FAIL,
	RESET_PASSWORD_SUCCESS,
	RESET_PASSWORD_FAIL,
	GET_USER_SUCCESS,
	GET_USER_FAIL,
	GET_USER_SETTINGS_SUCCESS,
	GET_USER_SETTINGS_FAIL,
	GET_USER_SUBSCRIPTION_DATA_FAIL,
	GET_USER_SUBSCRIPTION_DATA_SUCCESS,
	SUBSCRIBE_TO_EMAIL_LIST
} from './AccountConstants';
import { SET_TOAST } from '../hub/Views/AppView/AppViewConstants';
import { CLEAR_THEME } from '../panel/constants/constants';

export const getUserSettings = () => dispatch => (
	sendMessageInPromise('account.getUserSettings')
		.then((settings) => {
			const { errors } = settings;
			if (errors) {
				dispatch({
					type: GET_USER_SETTINGS_FAIL,
					payload: { errors },
				});
				return false;
			}
			dispatch({
				type: GET_USER_SETTINGS_SUCCESS,
				payload: { settings },
			});
			return settings;
		})
		.catch((error) => {
			log('PanelActions getUserSettings error', error);
			return false;
		})
);

export const getUser = () => dispatch => (
	sendMessageInPromise('account.getUser')
		.then((res) => {
			const { errors, user } = res;
			if (errors) {
				dispatch({
					type: GET_USER_FAIL,
					payload: { errors },
				});
				return false;
			}
			dispatch({
				type: GET_USER_SUCCESS,
				payload: { user },
			});
			return user;
		})
);
export const getUserSubscriptionData = () => dispatch => (
	sendMessageInPromise('account.getUserSubscriptionData')
		.then((res) => {
			const { errors, subscriptionData } = res;
			if (errors) {
				dispatch({
					type: GET_USER_SUBSCRIPTION_DATA_FAIL,
					payload: { errors },
				});
			} else {
				dispatch({
					type: GET_USER_SUBSCRIPTION_DATA_SUCCESS,
					payload: { subscriptionData },
				});
			}
			return res;
		})
);

export const login = (email, password) => dispatch => (
	sendMessageInPromise('account.login', { email, password })
		.then((res) => {
			const { errors } = res;
			if (errors) {
				dispatch({
					type: LOGIN_FAIL,
					payload: { errors },
				});
				return false;
			}
			dispatch({
				type: LOGIN_SUCCESS,
				payload: { email },
			});
			return true;
		})
		.catch((err) => {
			log('account.login() error:', err);
			const errors = [{ title: err.toString(), detail: err.toString() }];
			dispatch({
				type: LOGIN_FAIL,
				payload: {
					errors,
				},
			});
			return false;
		})
);

export const logout = () => dispatch => (
	sendMessageInPromise('account.logout', {})
		.then(() => {
			dispatch({ type: LOGOUT_SUCCESS });
			dispatch({ type: CLEAR_THEME });
		})
		.catch((err) => {
			const errors = [{ title: err.toString(), detail: err.toString() }];
			dispatch({
				type: LOGOUT_FAIL,
				payload: {
					errors,
				},
			});
		})
);

export const resetPassword = email => dispatch => (
	sendMessageInPromise('account.resetPassword', { email })
		.then((res) => {
			const { errors } = res;
			if (errors) {
				// Panel toast message
				dispatch({
					type: RESET_PASSWORD_FAIL,
					payload: { errors },
				});
				// Hub toast message
				dispatch({
					type: SET_TOAST,
					data: {
						toastMessage: t('banner_email_not_in_system_message'),
						toastClass: 'alert',
					},
				});
				return false;
			}
			dispatch({ type: RESET_PASSWORD_SUCCESS });
			return true;
		})
		.catch((err) => {
			const errors = [{ title: err.toString(), detail: err.toString() }];
			dispatch({
				type: RESET_PASSWORD_FAIL,
				payload: {
					errors,
				},
			});
		})
);

export const subscribeToEmailList = name => dispatch => (
	dispatch({
		type: SUBSCRIBE_TO_EMAIL_LIST,
		payload: { name },
	})
);
