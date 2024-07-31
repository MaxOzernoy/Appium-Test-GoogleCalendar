/*  Test Description
  This Appium script for the Google Calendar app performs:

    Skip Welcome Pages
    Create Event:
    Enter unique name, set "All day," and assign "Tangerine" color.
    Verify Creation
    Edit Event: Change name and save.
    Verify Edit
    Delete Event: Remove and confirm deletion.
    
  Error Handling
    Uses try-catch blocks for logging errors.

    Summary
  Tests creating, editing, and deleting an event in Google Calendar.*/

const { remote } = require('webdriverio');

// Current Date and Time
const currentTime = new Date();
const day = currentTime.getDate();
const month = currentTime.getMonth() + 1; // Months are zero-indexed
const year = currentTime.getFullYear();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();
const seconds = currentTime.getSeconds();

// Unique names and user data
const uniqueEventName = `Test event ${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
const uniqueEventNameEdited = `Edited ${uniqueEventName}`;
const emailAddressOfAuthorizedUser = 'jbc404@gmail.com';

// WebDriverIO options for Android
const opts = {
  hostname: process.env.APPIUM_HOST || '0.0.0.0',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities: {
    platformName: "Android",
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': '88JX019WM',
    'appium:platformVersion': "12",
    'appium:appPackage': "com.google.android.calendar",
    'appium:appActivity': "com.android.calendar.LaunchActivity",
  }
};

(async () => {
  const driver = await remote(opts);

  try {
    // High-level try block
    await driver.pause(5000);

    // Navigate through welcome page
    try {
      await navigateThroughWelcomePage(driver);
    } catch (error) {
      throw new Error(`Failed to navigate through the welcome page: ${error.message}`);
    }

    await driver.pause(5000);

    // Create an event
    try {
      await createEvent(driver, uniqueEventName);
    } catch (error) {
      throw new Error(`Failed to create the event: ${error.message}`);
    }

    // Verify event creation
    try {
      await verifyEvent(driver, uniqueEventName, 'All day:', 'Tangerine', emailAddressOfAuthorizedUser);
    } catch (error) {
      throw new Error(`Failed to verify the event: ${error.message}`);
    }

    // Edit the event
    try {
      await editEvent(driver, uniqueEventName, uniqueEventNameEdited);
    } catch (error) {
      throw new Error(`Failed to edit the event: ${error.message}`);
    }

    // Verify event editing
    try {
      await verifyEvent(driver, uniqueEventNameEdited, 'All day:', 'Tangerine', emailAddressOfAuthorizedUser);
    } catch (error) {
      throw new Error(`Failed to verify the edited event: ${error.message}`);
    }

    // Delete the event
    try {
      await deleteEvent(driver, uniqueEventNameEdited);
    } catch (error) {
      throw new Error(`Failed to delete the event: ${error.message}`);
    }

    // Verify event deletion
    try {
      await verifyEventDeletion(driver, uniqueEventNameEdited);
    } catch (error) {
      throw new Error(`Failed to verify event deletion: ${error.message}`);
    }

    console.log('Test has been finished successfully!');
  } catch (error) {
    console.error(`Test stopped unexpectedly: ${error.message}`);
  } finally {
    await driver.deleteSession();
  }
})();

async function navigateThroughWelcomePage(driver) {
  const skipButton = await driver.$('//*[@content-desc="next page"]');
  await skipButton.click();

  const gotItButton = await driver.$('//*[@resource-id="com.google.android.calendar:id/oobe_done_button"]');
  await gotItButton.click();
}

async function createEvent(driver, eventName) {
  const createButton = await driver.$('//*[@content-desc="Create new event or other calendar entries"]');
  await createButton.click();

  const eventButton = await driver.$('//*[@resource-id="com.google.android.calendar:id/speed_dial_event_container"]');
  await eventButton.click();

  const eventTitleField = await driver.$('//*[@resource-id="com.google.android.calendar:id/title"]');
  await eventTitleField.setValue(eventName);
  await driver.hideKeyboard();

  const switchAllDay = await driver.$('//android.widget.Switch');
  await switchAllDay.click();

  await driver.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward(2)');
  const colorPicker = await driver.$('//*[@resource-id="com.google.android.calendar:id/first_line_text" and @text="Default color"]');
  await colorPicker.click();

  const eventColor = await driver.$('//*[@text="Tangerine"]');
  await eventColor.click();

  const saveButton = await driver.$('//*[@resource-id="com.google.android.calendar:id/save"]');
  await saveButton.click();
}

async function verifyEvent(driver, eventName, eventDuration, eventColor, emailAddress) {
  const searchButton = await driver.$('//*[@content-desc="Search"]');
  await searchButton.click();

  const searchField = await driver.$('//*[@resource-id="com.google.android.calendar:id/search_text"]');
  await searchField.setValue(eventName);
  await driver.pressKeyCode(66);

  const createdEvent = await driver.$(`//*[@content-desc="${eventName}, ${eventDuration} , ${emailAddress}, ${eventColor}"]`);
  await createdEvent.click();

  const testEvent = await driver.$('//*[@resource-id="com.google.android.calendar:id/title"]');
  await testEvent.isDisplayed();
}

async function editEvent(driver, oldEventName, newEventName) {
  const editButton = await driver.$('//*[@content-desc="Edit"]');
  await editButton.click();

  const eventTitleField = await driver.$('//*[@resource-id="com.google.android.calendar:id/title"]');
  await eventTitleField.setValue(newEventName);

  const saveButton = await driver.$('//*[@resource-id="com.google.android.calendar:id/save"]');
  await saveButton.click();
}

async function deleteEvent(driver, eventName) {
  const kebabMenu = await driver.$('//*[@content-desc="More options"]');
  await kebabMenu.click();

  const deleteButton = await driver.$('//*[@resource-id="com.google.android.calendar:id/title" and @text="Delete"]');
  await deleteButton.click();

  const deleteConfirmationButton = await driver.$('//*[@resource-id="android:id/button1"]');
  await deleteConfirmationButton.click();
}

async function verifyEventDeletion(driver, eventName) {
  const searchField = await driver.$('//*[@resource-id="com.google.android.calendar:id/search_text"]');
  await searchField.click();
  await searchField.setValue(eventName);
  await driver.pressKeyCode(66);

  const noEntriesFound = await driver.$('//*[@resource-id="com.google.android.calendar:id/no_result_label"]');
  await noEntriesFound.isDisplayed();
}
