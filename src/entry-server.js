/**
 * @file client server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {createApp} from './app';
const router = createApp.$router;
const isDev = process.env.NODE_ENV !== 'production';

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default function (context) {
    return new Promise((resolve, reject) => {
        let {app, router, store} = createApp();

        let url = context.url;
        let fullPath = router.resolve(url).route.fullPath;

        const meta = app.$meta(); // here
        context.meta = meta; // and here

        if (fullPath !== url) {
            reject({url: fullPath});
        }

        // set router's location
        router.push(url);
        // wait until router has resolved possible async hooks
        router.onReady(() => {
            let matchedComponents = router.getMatchedComponents();

            // no matched routes
            if (!matchedComponents.length) {
                reject({code: 404});
            }

            // Call fetchData hooks on components matched by the route.
            // A preFetch hook dispatches a store action and returns a Promise,
            // which is resolved when the action is complete and store state has been
            // updated.
            let s = isDev && Date.now();
            Promise.all(matchedComponents.map(({asyncData}) => asyncData && asyncData({
                store,
                route: router.currentRoute
            }))).then(() => {
                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`);

                // After all preFetch hooks are resolved, our store is now
                // filled with the state needed to render the app.
                // Expose the state on the render context, and let the request handler
                // inline the state in the HTML response. This allows the client-side
                // store to pick-up the server-side state without having to duplicate
                // the initial data fetching on the client.
                context.state = store.state;
                context.isProd = process.env.NODE_ENV === 'production';
                resolve(app);
            }).catch(reject);
        }, reject);
    });
}
