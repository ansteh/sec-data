const { parse } = require('./parser');

const fileSrc = `${__dirname}/../../resources/stocks/AAPL/files/10-K_2018-11-05.xml`;

const wrapTimer = (calle) => {
  return (...args) => {
    const start = new Date();

    const stop = () => {
      const end = new Date();
      console.log(`${calle.name} took ${end.valueOf() - start.valueOf()} ms with payload:`, { args });
    };

    return calle(...args)
      .then((result) => { stop(); return result; })
      .catch((err) => { stop(); throw err; });
  };
};

wrapTimer(parse)(fileSrc)
  // .then(console.log)
  .catch(console.log);
