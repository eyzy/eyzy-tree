const data = [
  { text: 'Company A', id: 'c1', expanded: true, child: [
    { text: 'Team A-1', child: ['Member 1', 'Member 2'] },
    { text: 'Team A-2', expanded: true, child: ['Person 1', 'Person 2', { text: 'Person 3', checked: true }] },
    { text: 'Person: accountant' },
    { text: 'Person: bossi', disabled: true, checked: true }
  ] },
  { text: 'Company C', className: "aa cc dd ee", expanded: true, child: [
    { text: 'Team C-3', child: ['Member 3', 'Member 4'] },
    { text: 'Team C-4', expanded: true, child: ['Person 7', 'Person 8', { text: 'Person 9', checked: true }] }
  ] }
]