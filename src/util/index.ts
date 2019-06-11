import i18n from 'i18n-js';
import _ from 'lodash';
const geoConfig = require('../../geocoding.json');

const getTranslatedDistanceFromEnum = (distance) => {
    return i18n.t(`global.enums.distance.${distance}`);
}

const getTranslatedGenderFromEnum = (gender) => {
    return i18n.t(`global.enums.gender.${gender}`);
}

const sortPostsByPopularity = (posts: Array<any>) => {
    return _.sortBy(posts, post => {
        return - (post.commentsCount + post.rate);
    });
}

const getReverseLocationFromCoords = async({ latitude, longitude }) => {
    let response: any = await (await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${geoConfig.apiKey}`)).json();
    let result = response.results.filter(r => r.types.includes("locality") && !!r.address_components.find(ac => ac.types.includes("locality") && ac.types.includes("political")))
                                 .reduce((prev, curr) => {
                                    prev.push(...curr.address_components);
                                    return prev;
                                 }, []);


                                 console.log(result);
    let country = result.find(i => i.types.includes("country"));
    let city = result.find(i => i.types.includes("administrative_area_level_2"));

    return [{ 
        country: country && (country.long_name || country.short_name),
        city: city && (city.long_name || city.short_name),
    }]
}

export { getTranslatedDistanceFromEnum, getTranslatedGenderFromEnum, sortPostsByPopularity, getReverseLocationFromCoords };