## One more React Tree component

> Most expected tree ui component for React.

[![NPM version](https://img.shields.io/npm/v/eyzy-tree.svg?style=flat)](https://npmjs.com/package/eyzy-tree)
![NPM license](https://img.shields.io/npm/l/eyzy-tree.svg?style=flat)
[![NPM total downloads](https://img.shields.io/npm/dt/eyzy-tree.svg?style=flat)](https://npmcharts.com/compare/eyzy-tree?minimal=true)
[![NPM monthly downloads](https://img.shields.io/npm/dm/eyzy-tree.svg?style=flat)](https://npmcharts.com/compare/eyzy-tree?minimal=true)

[Documentation](https://eyzy.gitbook.io/tree/) | [Examples](https://eyzy.gitbook.io/tree/examples)

![assets_-LIk7qYrBMivIw5dM3CP_-LXrbHDPWExqQURbPB5D_-LXrfVI_P7Wt8GJVXrVe_red](https://user-images.githubusercontent.com/1006120/57123062-0f878e80-6d89-11e9-8dac-d0b60e7710fb.png)


### Features
- flexible configuration
- rich options
- rich API
- events for every action
- keyboard navigation
- check boxes
- multi-selection
- async support

### Table of Contents
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Customization](#customization)
- [Tree Props](#tree-props)
- [Tree Events](#tree-events)
- [Node Props](#node-props)

### Getting Started

Installing a package using the package manager.

```sh
# NPM
npm install eyzy-tree

# YARN
yarn add eyzy-tree
```

Connect in browser.

```html
<script src="https://cdn.jsdelivr.net/npm/eyzy-tree/dist/eyzy-tree.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/eyzy-tree/dist/style.css" rel="stylesheet" />
```

### Usage

```javascript
import React, { Component } from 'react'
import EyzyTree from 'eyzy-tree'
import 'eyzy-tree/style.css'

export default class Tree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [
        { text: 'Item 1' },
        { text: 'Item 2' },
        { text: 'Item 3' },
      ],
    };
  }

  render() {
    return (
      <div style={{ height: 400 }}>
        <EyzyTree
          data={this.state.data}
        />
      </div>
    );
  }
}

```

### Customization
[Click here](https://eyzy.gitbook.io/tree/customization) to find out how to configure the component.

### Tree Props

| Property | Type | Description | Default |
|:---------|:--------|:-----------------|:-----|
| `data` (required) | array | Specifies the tree nodes ||
| `fetchData` | function | Fetch child node if it has `isBatch` property ||
| `textRenderer` | ReactNode | Overrides `text container`. Gets the `Node` by argument || 
| `arrowRenderer` | ReactNode | Overrides `arrow container`. Gets the `Node` by argument || 
| `checkboxRenderer` | ReactNode | Overrides `checkbox container`. Gets the `Node` by argument || 
| `checkable` | boolean | Adds a **checkbox** before the tree nodes | false |
| `noCascade` | boolean | Whether to apply checkbox state to child nodes recursively | true |
| `useIndeterminateState` | boolean | Whether to show `indeterminate` state for node | true |
| `preventSelectParent` | boolean | Whether to allow to select node which has child (it will expand if `true`) | false |
| `keyboardNavigation` | boolean | Whether to allow navigate via keyboard | true |
| `selectOnExpand` | boolean | Whether to select a node if it has children | false | 
| `expandOnSelect` | boolean | Whether to expand a node if it has children | false |
| `checkOnSelect` | boolean | Selects a node and changes the state of the checkbox. | false |
| `selectOnCheck` | boolean | Whether to select a node if it checked (during the click) | false |
| `theme` | string | Additional class for tree container. | eyzy-theme |


### Tree Events

| Property | Arguments | Description |
|:---------|:--------|:-----------------|
| `onReady` | [API](https://eyzy.gitbook.io/tree/api/basic) | Call once when tree is ready (componentDidMount). | 
| `onSelect` | `TreeNode` | Calls every time when node is selected. | 
| `onUnSelect` | `TreeNode` | Calls every time when node is unselected. | 
| `onCheck` | `TreeNode` | Calls every time when node is checked. | 
| `onExpand` | `TreeNode` | Calls every time when node is expanded. | 
| `onRemove` | `TreeNode` | Calls every time when node is removed. | 
| `onAdd` | `TreeNode` | Calls every time when node is added. | 
| `onDoubleClick` | `TreeNode` | Calls every time when user do double click on the node. Works only when `expandOnSelect` is not defined or false | 


### Node Props

| Property | Type |    Description     |
|:---------|:--------|:-----------------------------------------|
| `id` | string | Node id. If not transmitted, automatically generated. |
| `text` (required) | string | Node text |
| `child` | Array<TreeNode> | List of child nodes |
| `data` | object | Any type of data |
| `isBatch` | boolean | Check the [API](https://app.gitbook.com/@eyzy/s/tree/guides/async) |
| `className` | string | Node class name |
| `checkable` | boolean | Whether to possible to check a node (checkbox will be hidden) |
| `loading` | boolean | Will be added `loading` class (indicator is added via CSS) |
| `selected` | boolean | Whether to select a node |
| `expanded` | boolean | Whether to expand a node |
| `checked` | boolean | Whether to check a node (if tree is checkable) |
| `disabled` | boolean | Whether to disable a node |
| `disabledCheckbox` | boolean | Whether to disable a node's checkbox |


### Licence
[MIT](https://opensource.org/licenses/MIT)
