const alltimeurl = new Request('https://fcctop100.herokuapp.com/api/fccusers/top/alltime');
const recenturl = new Request('https://fcctop100.herokuapp.com/api/fccusers/top/recent');

class App {
  constructor() {
    this.sort = 'alltime';
    this.datas = null;
    this.alltimedatas = null;
    this.recentdatas = null;

    /*
    ** Complete component lifecycle not available
    ** due to using Aurelia's basicConfiguration
    ** thus fetching data in constructor method
    **
    ** Unable to get Aurelia's standardConfiguration
    ** running in CodePen
    */
    fetch(alltimeurl).then(response => response.json())
                     .then(data => {
                       this.alltimedatas = [...data];
                       this.datas = [...data];
                     });

    fetch(recenturl).then(response => response.json())
                    .then(data => {
                      this.recentdatas = [...data];
                    });
  }
  
  changeData(sort) {
    this.sort = sort;
    if(sort === 'alltime') {
      this.datas = [...this.alltimedatas];
    }
    else {
      this.datas = [...this.recentdatas];
    }
  }
}

const app = new App();



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