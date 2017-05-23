/**
* Bernd Wessels (https://github.com/BerndWessels/)
*
* Copyright © 2016 Bernd Wessels. All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE.txt file in the root directory of this source tree.
*/

/**
 * Import dependencies.
 */
import {merge} from 'ramda';

/**
 * Import local dependencies.
 */
import {
    ROOT_FETCH_GRAPHQL_QUERY_SUCCEEDED
} from '../actions';

/**
 * Default CardTransaction entities state.
 */
const cardTransactionDefaultState = {};

/**
 * Export the CardTransaction entities store.
 */
export function cardTransactionReducer(state = cardTransactionDefaultState, action) {
    switch (action.type) {
        case ROOT_FETCH_GRAPHQL_QUERY_SUCCEEDED:
            return merge(state, action.payload.CardTransaction);
        default:
            return state;
    }
}
