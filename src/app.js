/**
 * @file entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import VueMeta from 'vue-meta';
import Vuetify from 'vuetify';
import {createRouter} from './router';
import {createStore} from './store';
import App from './App.vue';
import Icon from 'vue-awesome/components/Icon.vue';
/**
 * author: xiaoyang
 * time: 2017-8-04
 */
Vue.use(Vuetify);
Vue.use(VueMeta, {
  keyName: 'head', // the component option name that vue-meta looks for meta info on.
  attribute: 'data-vue-meta', // the attribute name vue-meta adds to the tags it observes
  ssrAttribute: 'data-vue-meta-server-rendered', // the attribute name that lets vue-meta know that meta info has already been server-rendered
  tagIDKeyName: 'vmid' // the property name that vue-meta uses to determine whether to overwrite or append a tag
});
Vue.component('icon', Icon);
Vue.config.productionTip = false;

/* eslint-disable no-new */
export function createApp() {
    let router = createRouter();
    let store = createStore();
    let app = new Vue({
        router,
        store,
        ...App
    });
    return {app, router, store};
}
