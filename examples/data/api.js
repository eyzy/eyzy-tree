const data = [
  { text: 'Company C', expanded: true, child: [
    { text: 'Team 1', child: ['Member 1', 'Member 2'] },
    { text: 'Team 2', expanded: true, child: ['Person 1', 'Person 2', { text: 'Person 3', checked: true }] },
    { text: 'Person: accountant' },
    { text: 'Person: bossi', disabled: true, checked: true }
  ] }
]