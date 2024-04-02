import { shallowMount } from '@vue/test-utils';
import EmresBirthdayPlanner from '@/views/MainPage.vue';
import { describe, beforeEach, test, expect } from 'vitest';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);


describe('EmresBirthdayPlanner', () => {
    let wrapper;
    const base_url_backend = import.meta.env.VITE_BACKEND_URL;

    beforeEach(() => {
        mock.reset();

        mock.onGet(`${base_url_backend}/item/items`).reply(200, {
            data: [{ id: 1, name: 'Mocked Item' }]
        });

        mock.onPost(`${base_url_backend}/item/items`).reply(200, {
            data: { id: 2, name: 'Newly Added Item' }
        });

        mock.onDelete(`${base_url_backend}/item/items/1`).reply(200, {
            data: 'Mocked delete item data'
        });

        wrapper = shallowMount(EmresBirthdayPlanner);
    });

    test('renders the main container', () => {
        expect(wrapper.classes()).toContain('container');
    });

    test('renders the title', () => {
        expect(wrapper.find('.title').text()).toBe("Emre's Birthday Planner");
    });
});
