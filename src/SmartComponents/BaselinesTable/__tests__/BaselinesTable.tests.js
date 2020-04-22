import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import toJson from 'enzyme-to-json';
import baselinesTableFixtures from '../redux/__tests__/baselinesTableReducer.fixtures';
import baselinesReducerHelpers from '../redux/helpers';

import ConnectedBaselinesTable, { BaselinesTable } from '../BaselinesTable';
import { sortable } from '@patternfly/react-table';

describe('BaselinesTable', () => {
    let props;

    beforeEach(() => {
        props = {
            loading: false,
            tableData: baselinesTableFixtures.baselineTableDataRows,
            tableId: 'CHECKBOX',
            hasMultiSelect: true,
            kebab: true,
            createButton: true,
            exportButton: true,
            columns: [
                { title: 'Name', transforms: [ sortable ]},
                { title: 'Last updated', transforms: [ sortable ]},
                { title: '' }
            ]
        };
    });

    it('should render multi-select table correctly', () => {
        const wrapper = shallow(
            <BaselinesTable { ...props }/>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render single-select table correctly', () => {
        props.hasMultiSelect = false;
        props.tableId = 'RADIO';
        const wrapper = shallow(
            <BaselinesTable { ...props }/>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render no matching baselines EmptyState', () => {
        props.tableData = [];
        const wrapper = shallow(
            <BaselinesTable { ...props }/>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render loading rows for multi-select', () => {
        props.loading = true;
        const wrapper = shallow(
            <BaselinesTable { ...props }/>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render loading rows for single-select', () => {
        props.loading = true;
        props.hasMultiSelect = false;
        const wrapper = shallow(
            <BaselinesTable { ...props }/>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});

describe('ConnectedBaselinesTable', () => {
    let initialState;
    let mockStore;
    let props;

    beforeEach(() => {
        mockStore = configureStore();
        initialState = {
            addSystemModalState: {
                addSystemModalOpened: false
            },
            baselinesTableState: {
                checkboxTable: {
                    baselineTableData: baselinesTableFixtures.baselineTableDataRows,
                    selectedBaselineIds: [ '1234' ]
                }
            }
        };

        props = {
            loading: false,
            tableData: baselinesTableFixtures.baselineTableDataRows,
            tableId: 'CHECKBOX',
            hasMultiSelect: true,
            kebab: true,
            createButton: true,
            exportButton: true,
            columns: [
                { title: 'Name', transforms: [ sortable ]},
                { title: 'Last updated', transforms: [ sortable ]},
                { title: '' }
            ]
        };
    });

    it('should render baseline selected', () => {
        const store = mockStore(initialState);
        props.tableData[0].selected = true;
        const wrapper = mount(
            <MemoryRouter keyLength={ 0 }>
                <Provider store={ store }>
                    <ConnectedBaselinesTable
                        { ...props }
                    />
                </Provider>
            </MemoryRouter>
        );

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should sort by display_name', () => {
        const store = mockStore(initialState);
        baselinesReducerHelpers.fetchBaselines = jest.fn();
        const wrapper = mount(
            <MemoryRouter keyLength={ 0 }>
                <Provider store={ store }>
                    <ConnectedBaselinesTable
                        { ...props }
                    />
                </Provider>
            </MemoryRouter>
        );

        wrapper.find('.pf-c-button').at(3).simulate('click');
        expect(baselinesReducerHelpers.fetchBaselines).toHaveBeenCalledWith(
            'CHECKBOX',
            expect.any(Function),
            {
                orderBy: 'display_name',
                orderHow: 'DESC'
            }
        );

        wrapper.find('.pf-c-button').at(3).simulate('click');
        expect(baselinesReducerHelpers.fetchBaselines).toHaveBeenCalledWith(
            'CHECKBOX',
            expect.any(Function),
            {
                orderBy: 'display_name',
                orderHow: 'ASC'
            }
        );
    });
});