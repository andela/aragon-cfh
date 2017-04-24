angular.module('mean.system')
  .factory('region', ['$http', function regionService($http) {
    const region = {
      regions: [
        {
          code: 'all',
          label: 'Worldwide'
        },
        {
          code: 'asi',
          label: 'Asia'
        },
        {
          code: 'cac',
          label: 'Central America and the Caribbean'
        },
        {
          code: 'eur',
          label: 'Europe'
        },
        {
          code: 'men',
          label: 'Middle East and North Africa'
        },
        {
          code: 'nam',
          label: 'North America'
        },
        {
          code: 'ocn',
          label: 'Oceania'
        },
        {
          code: 'sam',
          label: 'South America'
        },
        {
          code: 'ssa',
          label: 'Sub-Saharan Africa'
        }
      ]
    };

    const countries = {
      Afghanistan: 'men',
      Albania: 'eur',
      Algeria: 'men',
      Andorra: 'eur',
      Angola: 'ssa',
      'Antigua and Barbuda': 'cac',
      Argentina: 'sam',
      Armenia: 'eur',
      Australia: 'ocn',
      Austria: 'eur',
      Azerbaijan: 'men',
      Bahamas: 'cac',
      Bahrain: 'men',
      Bangladesh: 'asi',
      Barbados: 'cac',
      Belarus: 'eur',
      Belgium: 'eur',
      Belize: 'cac',
      Benin: 'ssa',
      Bhutan: 'asi',
      Bolivia: 'sam',
      'Bosnia and Herzegovina': 'eur',
      Botswana: 'ssa',
      Brazil: 'sam',
      Brunei: 'asi',
      Bulgaria: 'eur',
      'Burkina Faso': 'ssa',
      Burundi: 'ssa',
      Cambodia: 'asi',
      Cameroon: 'ssa',
      Canada: 'nam',
      'Cape Verde': 'ssa',
      'Central African Republic': 'ssa',
      Chad: 'ssa',
      Chile: 'sam',
      China: 'asi',
      Colombia: 'sam',
      Comoros: 'ssa',
      Congo: 'ssa',
      'Costa Rica': 'cac',
      Croatia: 'eur',
      Cuba: 'cac',
      Cyprus: 'eur',
      'Czech Republic': 'eur',
      Denmark: 'eur',
      Djibouti: 'ssa',
      Dominica: 'cac',
      'Dominican Republic': 'cac',
      'East Timor': 'ocn',
      Ecuador: 'sam',
      Egypt: 'men',
      'El Salvador': 'cac',
      'Equatorial Guinea': 'ssa',
      Eritrea: 'ssa',
      Estonia: 'eur',
      Ethiopia: 'ssa',
      'Federated States of Micronesia': 'ocn',
      Fiji: 'ocn',
      Finland: 'eur',
      France: 'eur',
      Gabon: 'ssa',
      Gambia: 'ssa',
      Georgia: 'eur',
      Germany: 'eur',
      Ghana: 'ssa',
      Greece: 'eur',
      Greenland: 'nam',
      Grenada: 'cac',
      Guatemala: 'cac',
      Guinea: 'ssa',
      'Guinea-Bissau': 'ssa',
      Guyana: 'sam',
      Haiti: 'cac',
      Honduras: 'cac',
      Hungary: 'eur',
      Iceland: 'eur',
      India: 'asi',
      Indonesia: 'asi',
      Iran: 'men',
      Iraq: 'men',
      Ireland: 'eur',
      Israel: 'men',
      Italy: 'eur',
      'Ivory Coast': 'ssa',
      Jamaica: 'cac',
      Japan: 'asi',
      Jordan: 'men',
      Kazakhstan: 'asi',
      Kenya: 'ssa',
      Kiribati: 'ocn',
      Kosovo: 'eur',
      Kuwait: 'men',
      Kyrgyzstan: 'asi',
      Laos: 'asi',
      Latvia: 'eur',
      Lebanon: 'men',
      Lesotho: 'ssa',
      Liberia: 'ssa',
      Libya: 'men',
      Liechtenstein: 'eur',
      Lithuania: 'eur',
      Luxembourg: 'eur',
      Macedonia: 'eur',
      Madagascar: 'ssa',
      Malawi: 'ssa',
      Malaysia: 'asi',
      Maldives: 'asi',
      Mali: 'ssa',
      Malta: 'eur',
      'Marshall Islands': 'ocn',
      Mauritania: 'ssa',
      Mauritius: 'ssa',
      Mexico: 'nam',
      Moldova: 'eur',
      Monaco: 'eur',
      Mongolia: 'asi',
      Montenegro: 'eur',
      Morocco: 'men',
      Mozambique: 'ssa',
      Myanmar: 'asi',
      Namibia: 'ssa',
      Nauru: 'ocn',
      Nepal: 'asi',
      Netherlands: 'eur',
      'New Zealand': 'ocn',
      Nicaragua: 'cac',
      Niger: 'ssa',
      Nigeria: 'ssa',
      'North Korea': 'asi',
      Norway: 'eur',
      Oman: 'men',
      Pakistan: 'men',
      Palau: 'ocn',
      Panama: 'cac',
      'Papua New Guinea': 'ocn',
      Paraguay: 'sam',
      Peru: 'sam',
      Philippines: 'asi',
      Poland: 'eur',
      Portugal: 'eur',
      Qatar: 'men',
      'Republic of the Congo': 'ssa',
      Romania: 'eur',
      Russia: 'eur',
      Rwanda: 'ssa',
      'Saint Kitts and Nevis': 'cac',
      'Saint Lucia': 'cac',
      'Saint Vincent and the Grenadines': 'cac',
      Samoa: 'ocn',
      'San Marino': 'eur',
      'Sao Tome and Principe': 'ssa',
      'Saudi Arabia': 'men',
      Senegal: 'ssa',
      Serbia: 'eur',
      Seychelles: 'ssa',
      'Sierra Leone': 'ssa',
      Singapore: 'asi',
      Slovakia: 'eur',
      Slovenia: 'eur',
      'Solomon Islands': 'ocn',
      Somalia: 'men',
      'South Africa': 'ssa',
      'South Korea': 'asi',
      'South Sudan': 'ssa',
      Spain: 'eur',
      'Sri Lanka': 'asi',
      Sudan: 'ssa',
      Suriname: 'sam',
      Swaziland: 'ssa',
      Sweden: 'eur',
      Switzerland: 'eur',
      Syria: 'men',
      Taiwan: 'asi',
      Tajikistan: 'asi',
      Tanzania: 'ssa',
      Thailand: 'asi',
      Togo: 'ssa',
      Tonga: 'ocn',
      'Trinidad and Tobago': 'cac',
      Tunisia: 'men',
      Turkey: 'men',
      Turkmenistan: 'asi',
      Tuvalu: 'ocn',
      Uganda: 'ssa',
      Ukraine: 'eur',
      'United Arab Emirates': 'men',
      'United Kingdom': 'eur',
      'United States': 'nam',
      Uruguay: 'sam',
      Uzbekistan: 'asi',
      Vanuatu: 'ocn',
      'Vatican City': 'eur',
      Venezuela: 'sam',
      Vietnam: 'asi',
      Yemen: 'men',
      Zambia: 'ssa',
      Zimbabwe: 'ssa'
    };

    region.getSelectedRegion = () => (
      new Promise((resolve) => {
        $http.get('http://freegeoip.net/json/')
        .then((res) => {
          if (Object.prototype.hasOwnProperty.call(countries, res.data.country_name)) {
            switch (countries[res.data.country_name]) {
              case 'asi':
                resolve(region.regions[1]);
                break;
              case 'cac':
                resolve(region.regions[2]);
                break;
              case 'eur':
                resolve(region.regions[3]);
                break;
              case 'men':
                resolve(region.regions[4]);
                break;
              case 'nam':
                resolve(region.regions[5]);
                break;
              case 'ocn':
                resolve(region.regions[6]);
                break;
              case 'sam':
                resolve(region.regions[7]);
                break;
              case 'ssa':
                resolve(region.regions[8]);
                break;
              default:
                resolve(region.regions[0]);
                break;
            }
          }
        }, (err) => {
          console.log(err);
          resolve(region.regions[0]);
        });
      })
    );

    return region;
  }]);
