/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */
require('module-alias/register');
// Using chai
const {expect} = require('chai');
const helper = require('@utils/helpers');
const files = require('@utils/files');
const loginCommon = require('@commonTests/loginBO');
// Importing pages
const LoginPage = require('@pages/BO/login');
const DashboardPage = require('@pages/BO/dashboard');
const OrdersPage = require('@pages/BO/orders/index');
// Test context imports
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_orders_orders_exportOrders';


let browserContext;
let page;
let filePath;

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    ordersPage: new OrdersPage(page),
  };
};
// Export orders and check csv file
describe('Export orders', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
    this.pageObjects = await init();
  });
  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Login into BO and go to orders page
  loginCommon.loginBO();

  it('should go to orders page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

    await this.pageObjects.dashboardPage.goToSubMenu(
      this.pageObjects.dashboardPage.ordersParentLink,
      this.pageObjects.dashboardPage.ordersLink,
    );

    await this.pageObjects.ordersPage.closeSfToolBar();

    const pageTitle = await this.pageObjects.ordersPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.ordersPage.pageTitle);
  });

  it('should export orders to a csv file', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'exportOrders', baseContext);

    filePath = await this.pageObjects.ordersPage.exportDataToCsv();
    const doesFileExist = await files.doesFileExist(filePath, 5000);
    await expect(doesFileExist, 'Export of data has failed').to.be.true;
  });

  it('should check existence of orders data in csv file', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkAllOrdersInCsvFile', baseContext);

    // Get number of orders
    const numberOfOrders = await this.pageObjects.ordersPage.getNumberOfElementInGrid();

    // Check each order in file
    for (let row = 1; row <= numberOfOrders; row++) {
      const orderInCsvFormat = await this.pageObjects.ordersPage.getOrderInCsvFormat(row);
      const textExist = await files.isTextInFile(filePath, orderInCsvFormat, true, true);
      await expect(textExist, `${orderInCsvFormat} was not found in the file`).to.be.true;
    }
  });
});
