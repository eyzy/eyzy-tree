var data = [
  {
    "text": "Angular.js",
    "expanded": true,
    "selected": true,
    "disabled": 1, 
    "id": "c1",
    "child": [
      {
        "text": "Angular.js 1.6"
      },
      {
        "text": "Angular.js 1.5", "disabled": true
      },
      {
        "text": "Angular.js 1.4", "disabled": true, "checked": true
      },
      {
        "text": "Angular.js 1.3", 
        "disabledCheckbox": true,
        "child": [
          { text: "Angular.js 1.3.1", disabled: true }, 
          "Angular.js 1.3.2", 
          "Angular.js 1.3.3",
          { text: "Angular.js 1.3.4", disabled: true }, 
        ]
      },
      {
        "text": "Angular.js 1.2", "disabledCheckbox": true, "checked": true
      }
    ]
  },
  {
    "text": "Ansible 2.4", "isBatch": true, "data": { isSuperNode: 1 }
  },
  {
    "text": "Apache HTTP Server", "data": { isSuperNode: true }
  },
  {
    "text": "Apache Pig",
    "data": { isSuperNode: false },
    "expanded": true,
    "child": [
      {
        "text": "Apache Pig 0.17"
      },
      {
        "text": "Apache Pig 0.16"
      },
      {
        "text": "Apache Pig 0.15", "expanded": true, "child": [
          "Apache Pig 0.15.1", 
          "Apache Pig 0.15.2",
          { "text": "Apache Pig 0.15.3", "checked": false, checkable: false}
        ]
      },
      {
        "text": "Apache Pig 0.14", "isBatch": true
      },
      {
        "text": "Apache Pig 0.13"
      }
    ]
  },
  {
    "text": "Async", "isBatch": true
  },
  {
    "text": "Babel", className: "aa"
  },
  {
    "text": "Backbone.js"
  },
  { text: 'Has Child', expanded: true, child: [1, 2, , 3, 4, 'Child 1'] }
]