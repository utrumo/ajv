{{# def.definitions }}
{{# def.setup:'multipleOf' }}

var division{{=$lvl}} = data{{=$dataLvl}} / {{=$schema}};
var valid = division{{=$lvl}} === parseInt(division{{=$lvl}});

{{# def.checkError:'multipleOf' }}