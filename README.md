## One more React Tree component

> Most expected React tree component.

[![NPM version](https://img.shields.io/npm/v/eyzy-tree.svg?style=flat)](https://npmjs.com/package/eyzy-tree)
![NPM license](https://img.shields.io/npm/l/eyzy-tree.svg?style=flat)
[![NPM total downloads](https://img.shields.io/npm/dt/eyzy-tree.svg?style=flat)](https://npmcharts.com/compare/eyzy-tree?minimal=true)
[![NPM monthly downloads](https://img.shields.io/npm/dm/eyzy-tree.svg?style=flat)](https://npmcharts.com/compare/eyzy-tree?minimal=true)

[Documentation](https://eyzy.gitbook.io/tree/) | [Examples](https://eyzy.gitbook.io/tree/examples/custom-theme)

### Features
- flexible configuration
- rich options
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
<script src="https://cdn.jsdelivr.net/npm/eyzy-tree/dist/eyzy-tree.js"></script>
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
| `theme` | string | Additional class for tree container. | eyzy-theme |
| `checkable` | boolean | Adds a **checkbox** before the tree nodes | false |
| `checkOnSelect` | boolean | Selects a node and changes the state of the checkbox. | false |
| `autoCheckChildren` | boolean | Whether to apply checkbox state to child nodes recursively. | true |
| `expandOnSelect` | boolean | Whether to expand a node if it has children | false |
| `selectOnExpand` | boolean | Whether to select a node if it has children | false | 
| `textRenderer` | ReactNode | Overrides `text container`. Gets the `Node` by argument. || 
| `arrowRenderer` | ReactNode | Overrides `arrow container`. Gets the `Node` by argument. || 
| `checkboxRenderer` | ReactNode | Overrides `checkbox container`. Gets the `Node` by argument. || 
| `onSelect` | function | Calls every time when node is selected. | 
| `onCheck` | function | Calls every time when node is checked. | 
| `onExpand` | function | Calls every time when node is expanded. | 
| `onDoubleClick` | function | Calls every time when user do double click on the node. Works only when `expandOnSelect` is not defined or false | 

### Node Props

| Property | Type |    Description     |
|:---------|:--------|:-----------------------------------------|
| `text` (required) | string | Node text |
| `child` | array | List of child nodes |
| `selected` | boolean | Whether to select a node |
| `expanded` | boolean | Whether to expand a node |
| `checked` | boolean | Whether to check a node (if tree is checkable) |
| `disabled` | boolean | Whether to disable a node |
| `disabledCheckbox` | boolean | Whether to disable a node's checkbox |
| `hidenCheckbox` | boolean | Whether to hide a node's checkbox |

### Licence
[MIT](https://opensource.org/licenses/MIT)