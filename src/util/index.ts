import i18n from 'i18n-js';
import _ from 'lodash';
import moment from 'moment';

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

export { getTranslatedDistanceFromEnum, getTranslatedGenderFromEnum, sortPostsByPopularity };