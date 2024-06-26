/* Copyright (c) 2015 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 * Copyright (c) 2023 Future Internet Consulting and Development Solutions S.L.
 * 
 * This file belongs to the business-ecosystem-logic-proxy of the
 * Business API Ecosystem
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    'use strict';

    angular.module('app').factory('User', ['$resource', '$injector', '$location', 'URLS', 'PARTY_ROLES', UserService]);

    function UserService($resource, $injector, $location, URLS, PARTY_ROLES) {
        var resource = $resource(
            URLS.USER,
            {
                username: '@id'
            },
            {
                updatePartial: {
                    method: 'PATCH'
                }
            }
        );

        var loggedUser = $injector.has('LOGGED_USER') ? $injector.get('LOGGED_USER') : null;

        if (loggedUser != null && loggedUser.organizations.length > 0) {
            const currUser = loggedUser.organizations[0]

            loggedUser.currentUser.name = currUser.name;
            loggedUser.currentUser.email = currUser.email;
            loggedUser.currentUser.id = currUser.id;
            loggedUser.currentUser.partyId = currUser.partyId;
            loggedUser.currentUser.href = loggedUser.href.replace(/(individual)\/(.*)/g, 'organization/' + currUser.partyId);

            loggedUser.currentUser.roles = currUser.roles;
        }

        return {
            detail: detail,
            updatePartial: updatePartial,
            loggedUser: loggedUser,
            isAuthenticated: isAuthenticated,
            serialize: serialize,
            serializeBasic: serializeBasic
        };

        function detail(next) {
            resource.get({ username: loggedUser.id }, next);
        }

        function updatePartial(data, next) {
            resource.updatePartial(data, next);
        }

        function isAuthenticated() {
            return angular.isObject(loggedUser);
        }

        function serialize() {
            var userInfo = serializeBasic();
            userInfo.role = PARTY_ROLES.OWNER;

            return userInfo;
        }

        function serializeBasic() {
            return {
                id: loggedUser.currentUser.partyId,
                href:
                    $location.protocol() +
                    '://' +
                    $location.host() +
                    ':' +
                    $location.port() +
                    loggedUser.currentUser.href
            };
        }
    }
})();
