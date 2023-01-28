class App {
  handleKeydown() {
    /*
    ** Using timeout instead of @observable
    ** due to using Aurelia's basicConfiguration
    **
    ** Unable to get Aurelia's standardConfiguration
    ** running in CodePen
    */
    setTimeout(() => {
      document.getElementById('result').innerHTML = marked(document.getElementById('markdown').innerText, { sanitize: true });
    });
    return(true);
  }
}

const app = new App();
document.getElementById('markdown').focus();



/*
** Aurelia Bootstrap Codes
*/

require.config({
  paths: { 'text': 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min' }
});

require(['aurelia-bootstrapper'], boot => {
  boot.bootstrap(aurelia => {
    aurelia.use
    .basicConfiguration();
    
    aurelia.start().then(() => {
      aurelia.enhance(app, document.getElementById('wrapper'));
    });
  });
});

/*
** Aurelia Bootstrap Codes
*/