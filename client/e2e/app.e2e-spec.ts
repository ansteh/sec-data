import { SecClientPage } from './app.po';

describe('sec-client App', () => {
  let page: SecClientPage;

  beforeEach(() => {
    page = new SecClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
