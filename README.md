## One more React Tree component

> Most expected React tree component.

### Features
- flexible
- customizable

### Table of Contents
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Themes](#themes)
- [Tree Props](#tree-props)

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
<script src="https://cdn.jsdelivr.net/npm/eyzy-tree/dist/eyzy-tree.umd.js"></script>
<link href="https://cdn.jsdelivr.net/npm/eyzy-tree/dist/style.css" rel="stylesheet" />
```

### Usage

```javascript
import React, { Component } from 'react'
import EyzyTree from 'eyzy-tree'
import 'eyzy-tree/dist/style.css'

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

### Themes

### Tree Props

| Property | Type | Description | Default |
|:---------|:--------|:-----------------|:-----|
| `data` (required) | array | Specifies the tree nodes ||
| `theme` | string | Additional class for tree container. | eyzy-theme |
| `checkable` | boolean | Adds a **checkbox** before the tree nodes | false |
| `checkOnSelect` | boolean | Selects a node and changes the state of the checkbox. | false |
| `expandOnSelect` | boolean | Whether to expand a node if it has children | false |
| `selectOnExpand` | boolean | Whether to select a node if it has children | false | 
| `textRenderer` | ReactNode | Overrides `text container`. Gets the `Node` by argument. || 
| `arrowRenderer` | ReactNode | Overrides `arrow container`. Gets the `Node` by argument. || 
| `checkboxRenderer` | ReactNode | Overrides `checkbox container`. Gets the `Node` by argument. || 
| `onSelect` | function | Calls every time when node is selected. | 
| `onCheck` | function | Calls every time when node is checked. | 
| `onExpand` | function | Calls every time when node is expanded. | 