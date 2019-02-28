import Current from './collections/current.js';

Meteor.publish('current', function() {
    return Current.find();
});