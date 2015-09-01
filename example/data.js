var faker = require('faker');

var generate = function(generator, size) {

  var list = [];
  for (var i = 0; i < size; i++) {
    list.push(generator(i));
  }
  return list;

};

var user = function(i) {
  return {
    userId: 'user_' + i,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    vod: {
      dimentions: {
        width: 100,
        height: 100
      },
      duration: 3600000000
    },
    country: [{ key: 30, text: 'Japan' }, { key: 19, text: 'Spain' }],
    comment: "ng-manager\nExtensible management console running on angular and material design.\n\nThis project is under development.",
    userIcon: '55/14/55149073c31b4f9ab651a1b02fcdf9bd/55149073c31b4f9ab651a1b02fcdf9bd%401421660751423-400k-00001',
    createdAt: faker.date.past(),
    boolean: true
  };
};

var company = function(i) {
  return {
    companyId: 'company_' + i,
    name: faker.company.companyName(),
    phrase: faker.company.catchPhrase(),
    country: faker.address.country(),
    address: {
      zipCode: faker.address.zipCode(),
      city: faker.address.city(),
      streetAddress: faker.address.streetAddress()
    },
    video: '55/14/55149073c31b4f9ab651a1b02fcdf9bd/55149073c31b4f9ab651a1b02fcdf9bd%401421660751423index',
    externalLink: 'https://github.com/dogenzaka/ng-manager'
  };
};

module.exports = {
  user: generate(user, 300),
  company: generate(company, 300)
};
