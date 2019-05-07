import i18n from 'i18n-js';

const getTranslatedDistanceFromEnum = (distance) => {
    return i18n.t(`global.enums.distance.${distance}`);
}

const getTranslatedGenderFromEnum = (gender) => {
    return i18n.t(`global.enums.gender.${gender}`);
}

export { getTranslatedDistanceFromEnum, getTranslatedGenderFromEnum };