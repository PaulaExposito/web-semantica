/**
 * SparkQL queries to Wikidata
 */

// Comic characters: https://query.wikidata.org/#SELECT%20DISTINCT%20%3FcomicCharacter%20%3FofficialName%20%0AWHERE%20%0A%7B%0A%20%20%3FcomicCharacter%20wdt%3AP1559%20%3FofficialName%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP31%20wd%3AQ1114461%20.%0A%7D%0ALIMIT%2020%0A%0A
const comicCharacters = `
  SELECT DISTINCT ?comicCharacter ?officialName 
  WHERE 
  {
    ?comicCharacter wdt:P1559 ?officialName ;
                    wdt:P31   wd:Q1114461   .
  }
  LIMIT 20
`;


// Comic Company Characters
function comicCompanyCharacters(company) { 
  return `
    SELECT DISTINCT ?comicCharacter ?officialName 
    WHERE 
    {
      ?comicCharacter wdt:P1559 ?officialName ;
                      wdt:P123  wd:${company} ;
                      wdt:P31   wd:Q1114461   .
    }
  `;
}


// Character info: https://query.wikidata.org/#SELECT%20DISTINCT%20%3FcomicCharacter%20%3FofficialName%20%3Finception%20%3Fgender%20%3Fcountry%20%3Focupation%20%3Fpublisher%20%3Fenemy%0AWHERE%20%0A%7B%0A%20%20%3FcomicCharacter%20wdt%3AP1559%20%3FofficialName%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP571%20%20%3Finception%20%20%20%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP21%20%20%20%3Fgender%20%20%20%20%20%20%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP106%20%20%3Focupation%20%20%20%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP27%20%20%20%3Fcountry%20%20%20%20%20%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP7047%20%3Fenemy%20%20%20%20%20%20%20%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP123%20%20%3Fpublisher%20%20%20%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP31%20wd%3AQ1114461%20%20%20%20%20.%0A%7D%0ALIMIT%2020%0A%0A
const characterInfo = `
SELECT DISTINCT ?comicCharacter ?officialName ?inception ?gender ?country ?ocupation ?publisher ?enemy
WHERE 
{
  ?comicCharacter wdt:P1559 ?officialName ;
                  wdt:P571  ?inception    ;
                  wdt:P21   ?gender       ;
                  wdt:P106  ?ocupation    ;
               
                  wdt:P27   ?country      ;
                  wdt:P7047 ?enemy        ;
                  
                  wdt:P123  ?publisher    ;
                  wdt:P31 wd:Q1114461     .
}
LIMIT 20
`;


// Professions (real): https://query.wikidata.org/#SELECT%20DISTINCT%20%3FcharacterType%20%3Flabel%0AWHERE%20%7B%0A%20%20%3FcharacterType%20rdfs%3Alabel%20%3Flabel%20%20%20%20%3B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wdt%3AP31%20wd%3AQ12737077%20.%0A%20%20%0A%20%20FILTER%20%28langMatches%28%20lang%28%3Flabel%29%2C%20%22es%22%20%29%20%29%0A%7D
const professions = `
  SELECT DISTINCT ?characterType ?label
  WHERE {
    ?characterType rdfs:label ?label    ; 
                  wdt:P31 wd:Q12737077 .
    
    FILTER (langMatches( lang(?label), "es" ) )
  }
  LIMIT 20
`;


// ID of input profession in spanish:
function profession(prof) {
  return `
    SELECT ?characterType
    WHERE
    { 
        ?characterType rdfs:label "${prof}"@es ;
                       wdt:P31 ?ocupation .
  
        FILTER (?ocupation IN (wd:Q28640, wd:Q12737077) )
        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        ?prop wikibase:directClaim wdt:P31 
    }
  `;
}


// Who I am
function whoiam(publisher, occupation) {
  return `
    SELECT DISTINCT ?comicCharacter ?officialName ?teamLabel ?enemyLabel ?image
    WHERE 
    {
      ?comicCharacter wdt:P1559 ?officialName       ;
                      wdt:P106  wd:${occupation}    ;
                      wdt:P123  wd:${publisher}     ;
                      wdt:P31   wd:Q1114461         .

      OPTIONAL {
        ?comicCharacter wdt:P463  ?team     ;
                        wdt:P7047 ?enemy    ;
                        wdt:P18   ?image    .

        ?team           wdt:P31   wd:Q14514600        .    # Member of a group of fictional characters
        ?enemy          wdt:P31   wd:Q1114461         .    # Enemies       
      }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
    }
  `;
}

module.exports = {
  comicCharacters,
  comicCompanyCharacters,
  characterInfo,
  professions,
  profession,
  whoiam,
}