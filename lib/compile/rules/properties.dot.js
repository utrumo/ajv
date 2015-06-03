{{# def.definitions }}
{{# def.setup:'properties' }}
{{# def.setupNextLevel }}


{{## def.validateProperty:useKey:
  var data{{=$dataNxt}} = data{{=$dataLvl}}[{{= useKey }}]
    , dataPath{{=$dataNxt}} = dataPath{{=$dataLvl}} + '.' + {{= useKey }};

  {{? $breakOnError }} var valid = {{?}}
    ({{= it.validate($it) }})(data{{=$dataNxt}}, dataPath{{=$dataNxt}});
#}}

{{
  var $dataNxt = $it.dataLevel = it.dataLevel + 1;

  var $pProperties = it.schema.patternProperties || {}
    , $pPropertyKeys = Object.keys($pProperties)
    , $aProperties = it.schema.additionalProperties
    , $noAdditional = $aProperties === false
    , $additionalIsSchema = typeof $aProperties == 'object'
                              && Object.keys($aProperties).length
    , $checkAdditional = $noAdditional || $additionalIsSchema;
}}


var errs{{=$lvl}} = validate.errors.length;
var valid = true;

{{? $checkAdditional }}
  var propertiesSchema{{=$lvl}} = validate.schema{{=$schemaPath}} || {};
{{?}}

{{? $noAdditional }}
  var valid = Object.keys(data{{=$dataLvl}}).length <= Object.keys(propertiesSchema{{=$lvl}}).length;
  {{# def.checkError:'additionalProperties' }}
  {{# def.elseIfValid }}
{{?}}

{{? $pPropertyKeys.length }}
  var pPropertiesSchema{{=$lvl}} = validate.schema{{= it.schemaPath + '.patternProperties' }}
    , pPropertiesRegexps{{=$lvl}} = {};

  for (var pProperty{{=$lvl}} in pPropertiesSchema{{=$lvl}})
    pPropertiesRegexps{{=$lvl}}[pProperty{{=$lvl}}] = new RegExp(pProperty{{=$lvl}});
{{?}}


{{? $checkAdditional }}
  for (var key{{=$lvl}} in data{{=$dataLvl}}) {
    var isAdditional{{=$lvl}} = !propertiesSchema{{=$lvl}}.hasOwnProperty(key{{=$lvl}});

    {{? $pPropertyKeys.length }}
      if (isAdditional{{=$lvl}}) {
        for (var pProperty{{=$lvl}} in pPropertiesSchema{{=$lvl}}) {
          var keyMatches{{=$lvl}} = pPropertiesRegexps{{=$lvl}}[pProperty{{=$lvl}}].test(key{{=$lvl}});
          if (keyMatches{{=$lvl}}) {
            isAdditional{{=$lvl}} = false;
            break;
          }
        }
      }
    {{?}}

    if (isAdditional{{=$lvl}}) {        
      {{? $noAdditional }}
        valid = false;
        {{# def.error:'additionalProperties' }}
        {{? $breakOnError }} break; {{?}}
      {{??}}
        {{ /* additionalProperties is schema */
          $it.schema = $aProperties;
          $it.schemaPath = it.schemaPath + '.additionalProperties';
        }}

        {{ var $useKey = 'key' + $lvl; }}
        {{# def.validateProperty:$useKey }}
        {{? $breakOnError }} if (!valid) break; {{?}}
      {{?}}
    }
  }

  {{# def.ifValid }}
{{?}}

{{? $schema }}
  {{ for (var $propertyKey in $schema) {  }}
    {{ var $sch = $schema[$propertyKey]; }}

    {{? Object.keys($sch).length }}
      {{
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '["' + it.escapeQuotes($propertyKey) + '"]';
      }}

      {{? $breakOnError }} valid = true; {{?}}
      if (data{{=$dataLvl}}.hasOwnProperty('{{= $propertyKey }}')) {
        {{ /* TODO cache data types and paths by keys for patternProperties */ }}
        {{ var $useKey = '"' + $propertyKey + '"'; }}
        {{# def.validateProperty:$useKey }}
      }
    {{?}}

    {{# def.ifValid }}
  {{  }  }}
{{?}}

{{~ $pPropertyKeys:$propertyKey }}
  {{ var $sch = $pProperties[$propertyKey]; }}

  {{? Object.keys($sch).length }}
    {{
      $it.schema = $sch;
      $it.schemaPath = it.schemaPath + '.patternProperties.' + $propertyKey;
    }}

    for (var key{{=$lvl}} in data{{=$dataLvl}}) {
      var keyMatches{{=$lvl}} = pPropertiesRegexps{{=$lvl}}['{{= $propertyKey }}'].test(key{{=$lvl}});

      if (keyMatches{{=$lvl}}) {
        {{ var $useKey = 'key' + $lvl; }}
        {{# def.validateProperty:$useKey }}
        {{? $breakOnError }} if (!valid) break; {{?}}
      }
    }

    {{# def.ifValid }}
  {{?}}
{{~}}

{{? $breakOnError }}{{= $closingBraces }}{{?}}

var valid = errs{{=$lvl}} == validate.errors.length;

{{# def.cleanUp }}