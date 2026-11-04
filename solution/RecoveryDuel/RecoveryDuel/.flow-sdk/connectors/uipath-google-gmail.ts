import { descriptor, triggerDescriptor, type ConnectorLookupValue, type ConnectorValue } from "@uipath/maestro-builder-sdk";

export interface ParentFolderInput {
  /** Email folder or label LOOKUP — sends a `folder.id`, never a name or e-mail: lookup(<Descriptor>, 'ParentFolders[*].ID') (helpers in the LOOKUP lines above the descriptor). */
  ID: ConnectorLookupValue<string>;
}

export interface Attachment {
  MIMEType?: string;
  ID?: string;
  Name?: string;
  Size?: number;
  fileId?: string;
  fileUrl?: string;
  iconLink?: string;
  mimeType?: string;
  title?: string;
}

export interface Category {
  ID?: string;
  Name?: string;
}

export interface Attendee {
  Type?: string;
  Response?: string;
  Name?: string;
  Email?: string;
  additionalGuests?: number;
  comment?: string;
  displayName?: string;
  email?: string;
  id?: string;
  optional?: boolean;
  organizer?: boolean;
  resource?: boolean;
  responseStatus?: string;
  self?: boolean;
}

export interface BCC {
  Name?: string;
  Email?: string;
}

export interface CC {
  Email?: string;
  Name?: string;
}

export interface To {
  Email?: string;
  Name?: string;
}

export interface From {
  Email?: string;
  Name?: string;
}

export interface ParentFolder {
  ID?: string;
  Name?: string;
}

export interface Creator {
  email?: string;
  self?: boolean;
  displayName?: string;
  id?: string;
}

export interface End {
  dateTime?: string;
  timeZone?: string;
  date?: string;
}

export interface Organizer {
  email?: string;
  self?: boolean;
  displayName?: string;
  id?: string;
}

export interface Reminders {
  useDefault?: boolean;
  overrides?: Array<Override>;
}

export interface Start {
  dateTime?: string;
  timeZone?: string;
  date?: string;
}

export interface ConferenceProperties {
  /** Types of conference solutions permitted for the calendar. */
  allowedConferenceSolutionTypes?: Array<string>;
}

export interface ConferenceData {
  conferenceId?: string;
  conferenceSolution?: ConferenceSolution;
  createRequest?: CreateRequest;
  entryPoints?: Array<EntryPoint>;
  notes?: string;
  signature?: string;
}

export interface ConferenceSolution {
  iconUri?: string;
  key?: Key;
  name?: string;
}

export interface Key {
  type?: string;
}

export interface CreateRequest {
  conferenceSolutionKey?: ConferenceSolutionKey;
  requestId?: string;
  status?: Status;
}

export interface ConferenceSolutionKey {
  type?: string;
}

export interface Status {
  statusCode?: string;
}

export interface EntryPoint {
  accessCode?: string;
  entryPointType?: string;
  label?: string;
  meetingCode?: string;
  passcode?: string;
  password?: string;
  pin?: string;
  uri?: string;
}

export interface Gadget {
  display?: string;
  height?: number;
  iconLink?: string;
  link?: string;
  title?: string;
  type?: string;
  width?: number;
}

export interface OriginalStartTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface Override {
  method?: string;
  minutes?: number;
}

export interface Source {
  title?: string;
  url?: string;
}

export interface CalendarEventCreatedWhere {
  /** Calendar from which to retrieve events LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarId') (helpers in the LOOKUP lines above the descriptor). */
  calendarId?: ConnectorLookupValue<string>;
}

export interface CalendarEventCreatedOutputs {
  /** Timezone of the calendar event */
  Timezone?: string;
  Attachments?: Array<Attachment>;
  Description?: string;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  Title?: string;
  CalendarName?: string;
  /** Start date/date time of the calendar event */
  From?: string;
  Attendees?: Array<Attendee>;
  Importance?: string;
  Sensitivity?: string;
  AllDay?: boolean;
  calendarId?: string;
  /** End date/date time of the calendar event */
  To?: string;
  ID?: string;
  ShowAs?: string;
  Location?: string;
}

/**
 * Calendar Event Created — uipath.connector.event.uipath-google-gmail.calendar-event-created
 *
 * Start a flow on it with `onEvent(CalendarEventCreated, { where: { … } })`, or pause for it
 * with `waitForEvent(CalendarEventCreated, { … })`; `where` carries its event parameters.
 *
 * LOOKUP: `calendarId` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(CalendarEventCreated, 'calendarId').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const CalendarEventCreated = triggerDescriptor<CalendarEventCreatedWhere, CalendarEventCreatedOutputs>()({
  connector: "uipath-google-gmail",
  event: "calendar-event-created",
  version: "1.0.0",
  displayName: "Calendar Event Created",
  lookups: {
    calendarId: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface CalendarEventReceivedWhere {
  /** Calendar from which to retrieve events LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarId') (helpers in the LOOKUP lines above the descriptor). */
  calendarId?: ConnectorLookupValue<string>;
}

export interface CalendarEventReceivedOutputs {
  /** Timezone of the calendar event */
  Timezone?: string;
  Attachments?: Array<Attachment>;
  Description?: string;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  Title?: string;
  CalendarName?: string;
  /** Start date/date time of the calendar event */
  From?: string;
  Attendees?: Array<Attendee>;
  Importance?: string;
  Sensitivity?: string;
  AllDay?: boolean;
  calendarId?: string;
  /** End date/date time of the calendar event */
  To?: string;
  ID?: string;
  ShowAs?: string;
  Location?: string;
}

/**
 * Calendar Event Received — uipath.connector.event.uipath-google-gmail.calendar-event-received
 *
 * Start a flow on it with `onEvent(CalendarEventReceived, { where: { … } })`, or pause for it
 * with `waitForEvent(CalendarEventReceived, { … })`; `where` carries its event parameters.
 *
 * LOOKUP: `calendarId` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(CalendarEventReceived, 'calendarId').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const CalendarEventReceived = triggerDescriptor<CalendarEventReceivedWhere, CalendarEventReceivedOutputs>()({
  connector: "uipath-google-gmail",
  event: "calendar-event-received",
  version: "1.0.0",
  displayName: "Calendar Event Received",
  lookups: {
    calendarId: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface CalendarEventRepliedWhere {
  /** Calendar from which to retrieve events LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarId') (helpers in the LOOKUP lines above the descriptor). */
  calendarId?: ConnectorLookupValue<string>;
}

export interface CalendarEventRepliedOutputs {
  /** Timezone of the calendar event */
  Timezone?: string;
  Attachments?: Array<Attachment>;
  Description?: string;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  Title?: string;
  CalendarName?: string;
  /** Start date/date time of the calendar event */
  From?: string;
  Attendees?: Array<Attendee>;
  Importance?: string;
  Sensitivity?: string;
  AllDay?: boolean;
  calendarId?: string;
  /** End date/date time of the calendar event */
  To?: string;
  ID?: string;
  ShowAs?: string;
  Location?: string;
}

/**
 * Calendar Event Replied — uipath.connector.event.uipath-google-gmail.calendar-event-replied
 *
 * Start a flow on it with `onEvent(CalendarEventReplied, { where: { … } })`, or pause for it
 * with `waitForEvent(CalendarEventReplied, { … })`; `where` carries its event parameters.
 *
 * LOOKUP: `calendarId` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(CalendarEventReplied, 'calendarId').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const CalendarEventReplied = triggerDescriptor<CalendarEventRepliedWhere, CalendarEventRepliedOutputs>()({
  connector: "uipath-google-gmail",
  event: "calendar-event-replied",
  version: "1.0.0",
  displayName: "Calendar Event Replied",
  lookups: {
    calendarId: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface CalendarEventUpdatedWhere {
  /** Calendar from which to retrieve events LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarId') (helpers in the LOOKUP lines above the descriptor). */
  calendarId?: ConnectorLookupValue<string>;
}

export interface CalendarEventUpdatedOutputs {
  /** Timezone of the calendar event */
  Timezone?: string;
  Attachments?: Array<Attachment>;
  Description?: string;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  Title?: string;
  CalendarName?: string;
  /** Start date/date time of the calendar event */
  From?: string;
  Attendees?: Array<Attendee>;
  Importance?: string;
  Sensitivity?: string;
  AllDay?: boolean;
  calendarId?: string;
  /** End date/date time of the calendar event */
  To?: string;
  ID?: string;
  ShowAs?: string;
  Location?: string;
}

/**
 * Calendar Event Updated — uipath.connector.event.uipath-google-gmail.calendar-event-updated
 *
 * Start a flow on it with `onEvent(CalendarEventUpdated, { where: { … } })`, or pause for it
 * with `waitForEvent(CalendarEventUpdated, { … })`; `where` carries its event parameters.
 *
 * LOOKUP: `calendarId` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(CalendarEventUpdated, 'calendarId').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const CalendarEventUpdated = triggerDescriptor<CalendarEventUpdatedWhere, CalendarEventUpdatedOutputs>()({
  connector: "uipath-google-gmail",
  event: "calendar-event-updated",
  version: "1.0.0",
  displayName: "Calendar Event Updated",
  lookups: {
    calendarId: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface EmailMovedToTrashOutputs {
  Attachments?: Array<Attachment>;
  BCC?: Array<BCC>;
  CC?: Array<CC>;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  To?: Array<To>;
  From?: From;
  Subject?: string;
  ParentFolders?: Array<ParentFolder>;
  Importance?: string;
  Sensitivity?: string;
  Type?: string;
  ThreadID?: string;
  ID?: string;
  Body?: string;
}

/**
 * Email Moved to Trash — uipath.connector.event.uipath-google-gmail.email-moved-to-trash
 *
 * Start a flow on it with `onEvent(EmailMovedToTrash, { where: { … } })`, or pause for it
 * with `waitForEvent(EmailMovedToTrash, { … })`; `where` carries its event parameters.
 */
export const EmailMovedToTrash = triggerDescriptor<Record<string, string>, EmailMovedToTrashOutputs>()({
  connector: "uipath-google-gmail",
  event: "email-moved-to-trash",
  version: "1.0.0",
  displayName: "Email Moved to Trash",
} as const);

export interface EmailReceivedWhere {
  ParentFolders: ConnectorValue<Array<ParentFolderInput>>;
}

export interface EmailReceivedOutputs {
  Attachments?: Array<Attachment>;
  BCC?: Array<BCC>;
  CC?: Array<CC>;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  To?: Array<To>;
  From?: From;
  Subject?: string;
  ParentFolders?: Array<ParentFolder>;
  Importance?: string;
  Sensitivity?: string;
  Type?: string;
  ThreadID?: string;
  ID?: string;
  Body?: string;
}

/**
 * Email Received — uipath.connector.event.uipath-google-gmail.email-received
 *
 * Start a flow on it with `onEvent(EmailReceived, { where: { … } })`, or pause for it
 * with `waitForEvent(EmailReceived, { … })`; `where` carries its event parameters.
 *
 * LOOKUP: `ParentFolders[*].ID` -> folder.id
 *   by: `displayName`
 *   use: lookup(EmailReceived, 'ParentFolders[*].ID').byDisplayName(value)
 *   also: .byDisplayName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const EmailReceived = triggerDescriptor<EmailReceivedWhere, EmailReceivedOutputs>()({
  connector: "uipath-google-gmail",
  event: "email-received",
  version: "1.0.0",
  displayName: "Email Received",
  lookups: {
    "ParentFolders[*].ID": {
      objectName: "folder",
      path: "/folder",
      by: ["displayName"],
      value: "id",
      aliases: { byDisplayName: "displayName" },
      strategy: "tree",
    },
  },
} as const);

export interface EmailSentOutputs {
  Attachments?: Array<Attachment>;
  BCC?: Array<BCC>;
  CC?: Array<CC>;
  HasAttachments?: boolean;
  Categories?: Array<Category>;
  To?: Array<To>;
  From?: From;
  Subject?: string;
  ParentFolders?: Array<ParentFolder>;
  Importance?: string;
  Sensitivity?: string;
  Type?: string;
  ThreadID?: string;
  ID?: string;
  Body?: string;
}

/**
 * Email Sent — uipath.connector.event.uipath-google-gmail.email-sent
 *
 * Start a flow on it with `onEvent(EmailSent, { where: { … } })`, or pause for it
 * with `waitForEvent(EmailSent, { … })`; `where` carries its event parameters.
 */
export const EmailSent = triggerDescriptor<Record<string, string>, EmailSentOutputs>()({
  connector: "uipath-google-gmail",
  event: "email-sent",
  version: "1.0.0",
  displayName: "Email Sent",
} as const);

export interface ExistingRecordDeleted__Outputs {
}

/**
 * Existing Record Deleted — uipath.connector.event.uipath-google-gmail.existing-record-deleted
 *
 * A GENERIC event: it fires for ONE object of the connection (an entity, a
 * table, a custom object), so name it — `onEvent(ExistingRecordDeleted__, { object: '<Object>' })`.
 * `uip is triggers objects uipath-google-gmail <EVENT> --connection-id <id>` lists them.
 */
export const ExistingRecordDeleted__ = triggerDescriptor<Record<string, string>, ExistingRecordDeleted__Outputs>()({
  connector: "uipath-google-gmail",
  event: "existing-record-deleted",
  version: "1.0.0",
  displayName: "Existing Record Deleted",
} as const);

export interface ExistingRecordUpdated__Outputs {
}

/**
 * Existing Record Updated — uipath.connector.event.uipath-google-gmail.existing-record-updated
 *
 * A GENERIC event: it fires for ONE object of the connection (an entity, a
 * table, a custom object), so name it — `onEvent(ExistingRecordUpdated__, { object: '<Object>' })`.
 * `uip is triggers objects uipath-google-gmail <EVENT> --connection-id <id>` lists them.
 */
export const ExistingRecordUpdated__ = triggerDescriptor<Record<string, string>, ExistingRecordUpdated__Outputs>()({
  connector: "uipath-google-gmail",
  event: "existing-record-updated",
  version: "1.0.0",
  displayName: "Existing Record Updated",
} as const);

export interface NewRecordCreated__Outputs {
}

/**
 * New Record Created — uipath.connector.event.uipath-google-gmail.new-record-created
 *
 * A GENERIC event: it fires for ONE object of the connection (an entity, a
 * table, a custom object), so name it — `onEvent(NewRecordCreated__, { object: '<Object>' })`.
 * `uip is triggers objects uipath-google-gmail <EVENT> --connection-id <id>` lists them.
 */
export const NewRecordCreated__ = triggerDescriptor<Record<string, string>, NewRecordCreated__Outputs>()({
  connector: "uipath-google-gmail",
  event: "new-record-created",
  version: "1.0.0",
  displayName: "New Record Created",
} as const);

export interface ApplyGmailLabelsInputs {
  /** Please choose the labels that you want to assign to this email LOOKUP — sends a `labels.id`, never a name or e-mail: lookup(<Descriptor>, 'addLabelIds[*]') (helpers in the LOOKUP lines above the descriptor). */
  addLabelIds: ConnectorLookupValue<Array<string>>;
  /** The ID of email to apply labels on */
  id: ConnectorValue<string>;
}

export interface ApplyGmailLabelsOutputs {
  /** Unique identifier for the email thread. */
  threadId?: string;
  /** A short preview of the email content. */
  snippet?: string;
  /** Unique identifier for the change history of the email. */
  historyId?: string;
  /** List of identifiers for labels currently applied to the email. */
  labelIds?: Array<string>;
  /** A unique identifier for the email message. */
  id?: string;
  /** An estimate of the email message size in bytes. */
  sizeEstimate?: number;
  /** The date and time when the email was received by Gmail. */
  internalDate?: string;
}

/**
 * Apply Gmail Labels — uipath.connector.uipath-google-gmail.apply-gmail-labels
 *
 * LOOKUP: `addLabelIds[*]` -> labels.id
 *   by: `name`
 *   use: lookup(ApplyGmailLabels, 'addLabelIds[*]').byName(value)
 *   also: .byName  ·  .by(name, value)
 *   strategy: paged scan (this operation declares no filterPattern)
 */
export const ApplyGmailLabels = descriptor<ApplyGmailLabelsInputs, ApplyGmailLabelsOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.apply-gmail-labels",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    "addLabelIds[*]": {
      objectName: "labels",
      path: "/labels",
      by: ["name"],
      value: "id",
      aliases: { byName: "name" },
      strategy: "scan",
    },
  },
} as const);

export interface ArchiveEmailInputs {
  /** The ID of email to archive */
  id: ConnectorValue<string>;
}

export interface ArchiveEmailOutputs {
  /** Unique ID representing the email thread. */
  threadId?: string;
  /** A short preview of the email content. */
  snippet?: string;
  /** Unique ID for tracking changes in the email. */
  historyId?: string;
  /** List of IDs representing labels assigned to the email. */
  labelIds?: Array<string>;
  /** Unique ID representing the specific email message. */
  id?: string;
  /** Approximate size of the email in bytes. */
  sizeEstimate?: number;
  /** The timestamp when the email was received by Gmail. */
  internalDate?: string;
}

/** Archive Email — uipath.connector.uipath-google-gmail.archive-email */
export const ArchiveEmail = descriptor<ArchiveEmailInputs, ArchiveEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.archive-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface CreateEventCalendarEventInputs {
  AllDayEvent?: ConnectorValue<boolean>;
  /** Guests can invite others */
  CanInviteOthers?: ConnectorValue<boolean>;
  /** Guests can modify event */
  CanModifyEvent?: ConnectorValue<boolean>;
  /** Guests can see attendees */
  CanSeeAttendeesList?: ConnectorValue<boolean>;
  /** The description of the event */
  Description?: ConnectorValue<string>;
  /** Date time when event ends */
  EndDateTime: ConnectorValue<string>;
  /** The name of event */
  EventTitle: ConnectorValue<string>;
  /** The location of the event */
  Location?: ConnectorValue<string>;
  /** The comma separated list of optional attendees */
  OptionalAttendees?: ConnectorValue<string>;
  /** Timezone for output event. */
  OutputEventTimezone?: ConnectorValue<string>;
  /** The comma separated list of required attendees */
  RequiredAttendees?: ConnectorValue<string>;
  /** The comma separated list of resource attendees */
  ResourceAttendees?: ConnectorValue<string>;
  /** Show as */
  ShowAs?: ConnectorValue<string>;
  /** Date time when event starts */
  StartDateTime: ConnectorValue<string>;
  /** The timezone for event's start and end time */
  Timezone: ConnectorValue<string>;
  /** Visibility of the event. */
  Visibility?: ConnectorValue<string>;
  /** If adding conference data is allowed or not. */
  AddConferenceData?: ConnectorValue<boolean>;
  /** Whether to send notifications about the creation of the new event. Note that some emails might still be sent. The default is false.Valid values: all, externalOnly, none. */
  SendNotifications?: ConnectorValue<string>;
  /** Calendar for event. LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'Calendar') (helpers in the LOOKUP lines above the descriptor). */
  Calendar?: ConnectorLookupValue<string>;
}

export interface CreateEventCalendarEventOutputs {
  /** Guests can invite others */
  CanInviteOthers?: boolean;
  /** Guests can see attendees */
  CanSeeAttendeesList?: boolean;
  /** Timezone for output event. */
  OutputEventTimezone?: string;
  /** Show as */
  ShowAs?: string;
  /** The timezone for event's start and end time */
  Timezone?: string;
  /** Visibility of the event. */
  Visibility?: string;
  created?: string;
  creator?: Creator;
  end?: End;
  etag?: string;
  eventType?: string;
  htmlLink?: string;
  iCalUID?: string;
  id?: string;
  kind?: string;
  organizer?: Organizer;
  reminders?: Reminders;
  sequence?: number;
  start?: Start;
  status?: string;
  summary?: string;
  updated?: string;
}

/**
 * Create Event (Calendar Event) — uipath.connector.uipath-google-gmail.create-event-calendar-event-
 *
 * LOOKUP: `Calendar` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(CreateEventCalendarEvent, 'Calendar').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const CreateEventCalendarEvent = descriptor<CreateEventCalendarEventInputs, CreateEventCalendarEventOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.create-event-calendar-event-",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    Calendar: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface DeleteEmailInputs {
  /** The ID of email to delete */
  id: ConnectorValue<string>;
  /** Indicates whether to delete the email permanently */
  permanentlyDelete?: ConnectorValue<boolean>;
}

export interface DeleteEmailOutputs {
  /** Unique identifier for the email thread. */
  threadId?: string;
  /** List of unique identifiers for labels assigned to the email. */
  labelIds?: Array<string>;
  /** Unique identifier for the specific email message. */
  id?: string;
}

/** Delete Email — uipath.connector.uipath-google-gmail.delete-email */
export const DeleteEmail = descriptor<DeleteEmailInputs, DeleteEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.delete-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface DeleteEventCalendarEventInputs {
  /** The calendar in which specified event is present LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarID') (helpers in the LOOKUP lines above the descriptor). */
  calendarID?: ConnectorLookupValue<string>;
  /** Indicates the option for event deletion */
  deleteOption?: ConnectorValue<string>;
  /** The ID of event to delete */
  id: ConnectorValue<string>;
}

export interface DeleteEventCalendarEventOutputs {
}

/**
 * Delete Event (Calendar Event) — uipath.connector.uipath-google-gmail.delete-event-calendar-event-
 *
 * LOOKUP: `calendarID` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(DeleteEventCalendarEvent, 'calendarID').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const DeleteEventCalendarEvent = descriptor<DeleteEventCalendarEventInputs, DeleteEventCalendarEventOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.delete-event-calendar-event-",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    calendarID: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface DownloadEmailInputs {
  /** Add the ID of email message you want to download */
  id: ConnectorValue<string>;
}

export interface DownloadEmailOutputs {
  /** Final output file */
  Response?: unknown;
}

/** Download Email — uipath.connector.uipath-google-gmail.download-email */
export const DownloadEmail = descriptor<DownloadEmailInputs, DownloadEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.download-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface DownloadEmailAttachmentByAttachmentIdInputs {
  /** Indicates whether to exclude the inline attachments, i.e. Attachments embedded in the email body */
  excludeInlineAttachment?: ConnectorValue<boolean>;
  /** The ID of attachment to be downloaded */
  id: ConnectorValue<string>;
}

export interface DownloadEmailAttachmentByAttachmentIdOutputs {
  /** Final output file */
  Response?: unknown;
}

/** Download Email Attachment by Attachment ID — uipath.connector.uipath-google-gmail.download-email-attachment-by-attachment-id */
export const DownloadEmailAttachmentByAttachmentId = descriptor<DownloadEmailAttachmentByAttachmentIdInputs, DownloadEmailAttachmentByAttachmentIdOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.download-email-attachment-by-attachment-id",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface DownloadEmailAttachmentByFileNameInputs {
  /** Add the ID of email message from which you want to download the attachments */
  id: ConnectorValue<string>;
  /** File wil be returned based on file name provided here. */
  fileName?: ConnectorValue<string>;
  /** Indicates whether to exclude the inline attachments, i.e. Attachments embedded in the email body */
  excludeInlineAttachment?: ConnectorValue<boolean>;
}

export interface DownloadEmailAttachmentByFileNameOutputs {
  /** Final output file */
  Response?: unknown;
}

/** Download Email Attachment by File Name — uipath.connector.uipath-google-gmail.download-email-attachment-by-file-name */
export const DownloadEmailAttachmentByFileName = descriptor<DownloadEmailAttachmentByFileNameInputs, DownloadEmailAttachmentByFileNameOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.download-email-attachment-by-file-name",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface ForwardEmailInputs {
  /** The new subject of the email. If left blank, the original subject is used */
  subject?: ConnectorValue<string>;
  /** The secondary recipients of the email, separated by comma (,) */
  cc?: ConnectorValue<string>;
  /** The hidden recipients of the email, separated by comma (,) */
  bcc?: ConnectorValue<string>;
  /** The body of the email */
  body?: ConnectorValue<string>;
  /** The primary recipients of the email, separated by comma (,) */
  to: ConnectorValue<string>;
  /** The ID of email to forward */
  id: ConnectorValue<string>;
  /** The attachment to be sent with the forwarded email */
  file?: ConnectorValue<string>;
  /** Specifies whether the email should be saved as draft instead of being sent */
  saveAsDraft?: ConnectorValue<boolean>;
}

export interface ForwardEmailOutputs {
  /** A unique identifier for the email thread. */
  threadId?: string;
  /** A list of identifiers for labels associated with the email. */
  labelIds?: Array<string>;
  /** A unique identifier for the specific email message. */
  id?: string;
}

/** Forward Email — uipath.connector.uipath-google-gmail.forward-email */
export const ForwardEmail = descriptor<ForwardEmailInputs, ForwardEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.forward-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface ForwardEventInputs {
  /** Comma separated list of email to indicates additional attendees to be added */
  attendees: ConnectorValue<string>;
  /** The ID of calendar in which event is present LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarID') (helpers in the LOOKUP lines above the descriptor). */
  calendarID?: ConnectorLookupValue<string>;
  /** The ID of even to forward */
  id: ConnectorValue<string>;
  /** Forward all occurance of the given series */
  forwardSeries?: ConnectorValue<boolean>;
}

export interface ForwardEventOutputs {
}

/**
 * Forward Event — uipath.connector.uipath-google-gmail.forward-event
 *
 * LOOKUP: `calendarID` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(ForwardEvent, 'calendarID').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const ForwardEvent = descriptor<ForwardEventInputs, ForwardEventOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.forward-event",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    calendarID: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface GetCalendarsInputs {
}

export interface GetCalendarsOutputs {
  /** Indicates the type of resource returned by the API. */
  kind?: string;
  /** A unique identifier for the version of the resource. */
  etag?: string;
  /** Indicates if the calendar is selected for display. */
  selected?: boolean;
  /** The color code used for the calendar's background. */
  backgroundColor?: string;
  /** An identifier for the calendar's color theme. */
  colorId?: string;
  /** A brief description of the calendar's purpose. */
  description?: string;
  conferenceProperties?: ConferenceProperties;
  /** Specifies the color used for the calendar's text and events. */
  foregroundColor?: string;
  /** Defines the level of access a user has to the calendar. */
  accessRole?: string;
  /** Provides a brief description or title of the calendar. */
  summary?: string;
  /** The time zone associated with the calendar. */
  timeZone?: string;
  /** The unique identifier for the calendar. */
  id?: string;
}

/** Get Calendars — uipath.connector.uipath-google-gmail.get-calendars */
export const GetCalendars = descriptor<GetCalendarsInputs, GetCalendarsOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-calendars",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface GetEmailByIdInputs {
  /** Metadata fields to be returned */
  metadataHeaders?: ConnectorValue<string>;
  /** Set to true if ID and ThreadId is required to be returned in response. */
  returnId?: ConnectorValue<boolean>;
  /** Set to true if attachments are nt requested to be returned in response */
  excludeAttachments?: ConnectorValue<boolean>;
  /** The unique identifier for the email */
  id: ConnectorValue<string>;
}

export interface GetEmailByIdOutputs {
  BCC?: Array<BCC>;
  Body?: string;
  CC?: Array<CC>;
  ParentFolders?: Array<ParentFolder>;
  ID?: string;
  From?: From;
  Subject?: string;
  To?: Array<To>;
  HasAttachments?: boolean;
  Attachments?: Array<Attachment>;
  Importance?: string;
  Sensitivity?: string;
  Categories?: Array<Category>;
  Type?: string;
  ThreadID?: string;
}

/** Get Email by ID — uipath.connector.uipath-google-gmail.get-email-by-id */
export const GetEmailById = descriptor<GetEmailByIdInputs, GetEmailByIdOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-email-by-id",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface GetEmailListInputs {
  /** The page size. Max and defaults to 10 if not provided. */
  pageSize?: ConnectorValue<number>;
  /** The next page cursor, taken from the response header `elements-next-page-token` */
  nextPage?: ConnectorValue<string>;
  /** Return emails with only attachment. */
  withAttachmentsOnly?: ConnectorValue<boolean>;
  /** Return only important emails. */
  importantOnly?: ConnectorValue<boolean>;
  /** Indicates wether to mark the retrieved mails as read */
  markAsRead?: ConnectorValue<boolean>;
  /** Include email messages from selected folder's subfolder */
  includeSubfolders?: ConnectorValue<boolean>;
  /** Return only starred emails. */
  starredOnly?: ConnectorValue<boolean>;
  /** The number of email to retrieve */
  limitEmailsToFirst?: ConnectorValue<string>;
  /** The folder or label to get email messages from LOOKUP — sends a `folder.referenceID`, never a name or e-mail: lookup(<Descriptor>, 'emailFolder') (helpers in the LOOKUP lines above the descriptor). */
  emailFolder: ConnectorLookupValue<string>;
  /** Return only unread emails. */
  unreadOnly?: ConnectorValue<boolean>;
  /** Additional filters for filtering email */
  additionalFilters?: ConnectorValue<string>;
}

export interface GetEmailListOutputs {
  ID?: string;
  ThreadID?: string;
  From?: From;
  To?: Array<To>;
  Subject?: string;
  CC?: Array<CC>;
  BCC?: Array<BCC>;
  HasAttachments?: boolean;
  ParentFolders?: Array<ParentFolder>;
  Categories?: Array<Category>;
  Type?: string;
}

/**
 * Get Email List — uipath.connector.uipath-google-gmail.get-email-list
 *
 * LOOKUP: `emailFolder` -> folder.referenceID
 *   by: `displayName`
 *   use: lookup(GetEmailList, 'emailFolder').byDisplayName(value)
 *   also: .byDisplayName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const GetEmailList = descriptor<GetEmailListInputs, GetEmailListOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-email-list",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    emailFolder: {
      objectName: "folder",
      path: "/folder",
      by: ["displayName"],
      value: "referenceID",
      aliases: { byDisplayName: "displayName" },
      strategy: "tree",
    },
  },
} as const);

export interface GetEventByIdCalendarEventInputs {
  /** The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. */
  maxAttendees?: ConnectorValue<string>;
  /** Time zone used in the response. Optional. The default is the time zone of the calendar. */
  timeZone?: ConnectorValue<string>;
  /** The ID of calendar in which respective event is present LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarID') (helpers in the LOOKUP lines above the descriptor). */
  calendarID?: ConnectorLookupValue<string>;
  /** The ID of the calendar event */
  id: ConnectorValue<string>;
}

export interface GetEventByIdCalendarEventOutputs {
  anyoneCanAddSelf?: boolean;
  attachments?: Array<Attachment>;
  attendeesOmitted?: boolean;
  attendees?: Array<Attendee>;
  colorId?: string;
  conferenceData?: ConferenceData;
  created?: string;
  creator?: Creator;
  description?: string;
  end?: End;
  endTimeUnspecified?: boolean;
  etag?: string;
  eventType?: string;
  gadget?: Gadget;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  hangoutLink?: string;
  htmlLink?: string;
  iCalUID?: string;
  id?: string;
  kind?: string;
  location?: string;
  locked?: boolean;
  organizer?: Organizer;
  originalStartTime?: OriginalStartTime;
  privateCopy?: boolean;
  recurrence?: Array<string>;
  recurringEventId?: string;
  reminders?: Reminders;
  sequence?: number;
  source?: Source;
  start?: Start;
  status?: string;
  summary?: string;
  transparency?: string;
  updated?: string;
  visibility?: string;
}

/**
 * Get Event by ID (Calendar Event) — uipath.connector.uipath-google-gmail.get-event-by-id-calendar-event-
 *
 * LOOKUP: `calendarID` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(GetEventByIdCalendarEvent, 'calendarID').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const GetEventByIdCalendarEvent = descriptor<GetEventByIdCalendarEventInputs, GetEventByIdCalendarEventOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-event-by-id-calendar-event-",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    calendarID: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface GetEventListInputs {
  /** Timezone for current event */
  Timezone?: ConnectorValue<string>;
  /** Indicates the date and time as of when to search for events. Date time should be in ISO 8601 format with Zulu time. */
  From: ConnectorValue<string>;
  /** The filter is applied to following fields: Summary, Description, Attendee's, Display Name, Attendee's Email, and Location. */
  simpleSearch?: ConnectorValue<string>;
  /** Indicates the date and time until which to search for events. Date time should be in ISO 8601 format with Zulu time. */
  Until: ConnectorValue<string>;
  /** The Calendar for the event. If left empty, default calendar will be used. LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'Calendar') (helpers in the LOOKUP lines above the descriptor). */
  Calendar?: ConnectorLookupValue<string>;
  /** The maximum number of events to return */
  Limit?: ConnectorValue<string>;
}

export interface GetEventListOutputs {
  /** Start date/date time of the calendar event */
  From?: string;
  /** End date/date time of the calendar event */
  To?: string;
  /** Timezone of the calendar event */
  Timezone?: string;
  AllDay?: boolean;
  Attendees?: Array<Attendee>;
  CalendarID?: string;
  CalendarName?: string;
  Description?: string;
  HasAttachments?: boolean;
  ID?: string;
  Title?: string;
  selfOrganizer?: boolean;
}

/**
 * Get Event List — uipath.connector.uipath-google-gmail.get-event-list
 *
 * LOOKUP: `Calendar` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(GetEventList, 'Calendar').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const GetEventList = descriptor<GetEventListInputs, GetEventListOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-event-list",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    Calendar: {
      objectName: "CuratedCalendarList",
      path: "/hubs/general/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface GetGmailLabelsInputs {
  /** parent Reference of the label */
  parentReference?: ConnectorValue<string>;
}

export interface GetGmailLabelsOutputs {
  /** A unique identifier for the folder. */
  referenceID?: string;
  /** The name of the folder as shown in the user interface. */
  displayName?: string;
  /** The unique identifier for the folder. */
  id?: string;
  /** A boolean flag to determine if the item is a folder or not. */
  isFolder?: boolean;
  /** Indicates if the label is visible in the label list. */
  labelListVisibility?: string;
  /** Indicates if messages are visible in the folder's message list. */
  messageListVisibility?: string;
  /** The unique identifier name of the folder used by the system. */
  name?: string;
  /** A reference identifier for the parent folder, if any. */
  parentReference?: string;
  /** The type of the folder, such as inbox, sent, etc. */
  type?: string;
}

/** Get Gmail Labels — uipath.connector.uipath-google-gmail.get-gmail-labels */
export const GetGmailLabels = descriptor<GetGmailLabelsInputs, GetGmailLabelsOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-gmail-labels",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface GetNewestEmailInputs {
  /** Indicate whether to include only unread emails */
  unreadOnly?: ConnectorValue<boolean>;
  /** Indicates whether to consider only important emails */
  importantOnly?: ConnectorValue<boolean>;
  /** The folder or label from where to get email messages LOOKUP — sends a `folder.referenceID`, never a name or e-mail: lookup(<Descriptor>, 'emailFolder') (helpers in the LOOKUP lines above the descriptor). */
  emailFolder: ConnectorLookupValue<string>;
  /** Additional filter for query */
  additionalFilter?: ConnectorValue<string>;
  /** Indicates whether to include only emails with attachment */
  withAttachmentOnly?: ConnectorValue<boolean>;
  /** Indicates whether to mark the retrieve email as read */
  markAsRead?: ConnectorValue<boolean>;
  /** Indicates whether to consider only starred emails */
  starredOnly?: ConnectorValue<boolean>;
}

export interface GetNewestEmailOutputs {
  Attachments?: Array<Attachment>;
  Categories?: Array<Category>;
  /** Indicates whether the email contains any attachments. */
  HasAttachments?: boolean;
  To?: Array<To>;
  From?: From;
  /** The subject line of the email message. */
  Subject?: string;
  ParentFolders?: Array<ParentFolder>;
  /** Indicates the priority or significance of the email. */
  Importance?: string;
  /** Specifies the category or format of the email. */
  Type?: string;
  /** A unique identifier for the email thread. */
  ThreadID?: string;
  /** The unique identifier for the email. */
  ID?: string;
  /** The main content of the email message. */
  Body?: string;
}

/**
 * Get Newest Email — uipath.connector.uipath-google-gmail.get-newest-email
 *
 * LOOKUP: `emailFolder` -> folder.referenceID
 *   by: `displayName`
 *   use: lookup(GetNewestEmail, 'emailFolder').byDisplayName(value)
 *   also: .byDisplayName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const GetNewestEmail = descriptor<GetNewestEmailInputs, GetNewestEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-newest-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    emailFolder: {
      objectName: "folder",
      path: "/folder",
      by: ["displayName"],
      value: "referenceID",
      aliases: { byDisplayName: "displayName" },
      strategy: "tree",
    },
  },
} as const);

export interface GetSingleGmailLabelInputs {
  /** Enter text */
  id: ConnectorValue<string>;
}

export interface GetSingleGmailLabelOutputs {
  /** The name of the folder as shown in the user interface. */
  displayName?: string;
  /** The unique identifier for the folder. */
  id?: string;
  /** Indicates if the label is visible in the label list. */
  labelListVisibility?: string;
  /** Indicates if messages are visible in the folder's message list. */
  messageListVisibility?: string;
  /** The unique identifier name of the folder used by the system. */
  name?: string;
  /** The type of the folder, such as inbox, sent, etc. */
  type?: string;
  /** The total count of messages within the folder. */
  messagesTotal?: number;
  /** The total number of unread messages within the folder. */
  messagesUnread?: number;
  /** The total number of unread conversation threads within the folder. */
  threadsUnread?: number;
  /** The total count of email threads within the folder. */
  threadsTotal?: number;
}

/** Get Single Gmail Label — uipath.connector.uipath-google-gmail.get-single-gmail-label */
export const GetSingleGmailLabel = descriptor<GetSingleGmailLabelInputs, GetSingleGmailLabelOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.get-single-gmail-label",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface ListEmailAttachmentsInputs {
  /** The ID of email message to retrieve attachments list */
  id: ConnectorValue<string>;
  /** Indicates whether to exclude the inline attachments, i.e. Attachments embedded in the email body */
  excludeInlineAttachment?: ConnectorValue<boolean>;
}

export interface ListEmailAttachmentsOutputs {
  /** Name of attached file */
  name?: string;
  /** Is the attachment part of email body (inline) or an actual attached file. */
  isInline?: boolean;
  /** The ID of attachment present in email */
  attachmentID?: string;
}

/** List Email Attachments — uipath.connector.uipath-google-gmail.list-email-attachments */
export const ListEmailAttachments = descriptor<ListEmailAttachmentsInputs, ListEmailAttachmentsOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.list-email-attachments",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface MarkEmailAsReadOrUnreadInputs {
  /** The ID of email to mark read or unread. */
  id: ConnectorValue<string>;
  /** The new state of the selected email */
  markAs?: ConnectorValue<string>;
}

export interface MarkEmailAsReadOrUnreadOutputs {
  /** Unique ID representing the email thread. */
  threadId?: string;
  /** A brief preview of the email content. */
  snippet?: string;
  /** Unique ID for tracking changes in the email. */
  historyId?: string;
  /** List of IDs representing labels assigned to the email. */
  labelIds?: Array<string>;
  /** Unique ID representing the specific email message. */
  id?: string;
  /** Approximate size of the email in bytes. */
  sizeEstimate?: number;
  /** The timestamp when the email was received. */
  internalDate?: string;
}

/** Mark Email As Read or Unread — uipath.connector.uipath-google-gmail.mark-email-as-read-or-unread */
export const MarkEmailAsReadOrUnread = descriptor<MarkEmailAsReadOrUnreadInputs, MarkEmailAsReadOrUnreadOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.mark-email-as-read-or-unread",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface MoveEmailInputs {
  /** The folder or label where to move the email message LOOKUP — sends a `folder.id`, never a name or e-mail: lookup(<Descriptor>, 'addLabelId') (helpers in the LOOKUP lines above the descriptor). */
  addLabelId: ConnectorLookupValue<string>;
  /** The email ID to move */
  id: ConnectorValue<string>;
}

export interface MoveEmailOutputs {
  /** A unique identifier for the email thread. */
  threadId?: string;
  /** A list of identifiers for labels associated with the email. */
  labelIds?: Array<string>;
  /** A unique identifier for the specific email message. */
  id?: string;
}

/**
 * Move Email — uipath.connector.uipath-google-gmail.move-email
 *
 * LOOKUP: `addLabelId` -> folder.id
 *   by: `displayName`
 *   use: lookup(MoveEmail, 'addLabelId').byDisplayName(value)
 *   also: .byDisplayName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const MoveEmail = descriptor<MoveEmailInputs, MoveEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.move-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    addLabelId: {
      objectName: "folder",
      path: "/folder",
      by: ["displayName"],
      value: "id",
      aliases: { byDisplayName: "displayName" },
      strategy: "tree",
    },
  },
} as const);

export interface RemoveGmailLabelsInputs {
  /** Please choose the labels that you want to remove from this email LOOKUP — sends a `labels.id`, never a name or e-mail: lookup(<Descriptor>, 'removeLabelIds[*]') (helpers in the LOOKUP lines above the descriptor). */
  removeLabelIds: ConnectorLookupValue<Array<string>>;
  /** The ID of message to remove labels from */
  id: ConnectorValue<string>;
}

export interface RemoveGmailLabelsOutputs {
  /** Unique identifier for the email thread. */
  threadId?: string;
  /** List of identifiers for labels currently applied to the email. */
  labelIds?: Array<string>;
  /** Unique identifier for the specific email message. */
  id?: string;
}

/**
 * Remove Gmail Labels — uipath.connector.uipath-google-gmail.remove-gmail-labels
 *
 * LOOKUP: `removeLabelIds[*]` -> labels.id
 *   by: `name`
 *   use: lookup(RemoveGmailLabels, 'removeLabelIds[*]').byName(value)
 *   also: .byName  ·  .by(name, value)
 *   strategy: paged scan (this operation declares no filterPattern)
 */
export const RemoveGmailLabels = descriptor<RemoveGmailLabelsInputs, RemoveGmailLabelsOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.remove-gmail-labels",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    "removeLabelIds[*]": {
      objectName: "labels",
      path: "/labels",
      by: ["name"],
      value: "id",
      aliases: { byName: "name" },
      strategy: "scan",
    },
  },
} as const);

export interface ReplyToEmailInputs {
  /** Additional secondary recipients of the email, separated by comma (,) */
  cc?: ConnectorValue<string>;
  /** Additional hidden recipients of the email, separated by comma (,) */
  bcc?: ConnectorValue<string>;
  /** The new subject of the email. If left blank, the original subject is used. */
  subject?: ConnectorValue<string>;
  /** The importance of the mail */
  importance?: ConnectorValue<string>;
  /** Additional primary recipients of the email, separated by comma (,) */
  to?: ConnectorValue<string>;
  /** The body of the email */
  body?: ConnectorValue<string>;
  /** The attachment to be sent with the reply email */
  file?: ConnectorValue<string>;
  /** Specifies whether to send the reply to all the recipients of the initial email */
  replyToAll?: ConnectorValue<boolean>;
  /** The ID of email to reply to. This can be retrieved from a trigger activity or get email activities. */
  id: ConnectorValue<string>;
  /** Specifies whether the email should be saved as draft instead of being sent */
  saveAsDraft?: ConnectorValue<boolean>;
}

export interface ReplyToEmailOutputs {
  /** Unique identifier for the email conversation thread. */
  threadId?: string;
  /** Unique identifiers for the labels associated with the email. */
  labelIds?: Array<string>;
  /** A unique identifier for the email message. */
  id?: string;
}

/** Reply to Email — uipath.connector.uipath-google-gmail.reply-to-email */
export const ReplyToEmail = descriptor<ReplyToEmailInputs, ReplyToEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.reply-to-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface RespondToEventInvitationCalendarEventInputs {
  /** The note sent along the response. Comment is not sent when 'Send response notification' is disabled. */
  comment?: ConnectorValue<string>;
  /** The number of additional guests */
  additionalGuests?: ConnectorValue<number>;
  /** The response sent to event organizer */
  response: ConnectorValue<string>;
  /** The calendar in which respective event invitation is present LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'calendarID') (helpers in the LOOKUP lines above the descriptor). */
  calendarID?: ConnectorLookupValue<string>;
  /** Notify organizer of the response */
  sendNotification?: ConnectorValue<boolean>;
  /** The event's invitation to be replied */
  id: ConnectorValue<string>;
  /** Update all occurances of the event with same reply */
  applyOnSeries?: ConnectorValue<boolean>;
}

export interface RespondToEventInvitationCalendarEventOutputs {
}

/**
 * Respond to Event Invitation (Calendar Event) — uipath.connector.uipath-google-gmail.respond-to-event-invitation-calendar-event-
 *
 * LOOKUP: `calendarID` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(RespondToEventInvitationCalendarEvent, 'calendarID').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const RespondToEventInvitationCalendarEvent = descriptor<RespondToEventInvitationCalendarEventInputs, RespondToEventInvitationCalendarEventOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.respond-to-event-invitation-calendar-event-",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    calendarID: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);

export interface SendEmailInputs {
  /** The hidden recipients of the email, separated by comma (,) */
  BCC?: ConnectorValue<string>;
  /** The body of the email */
  Body?: ConnectorValue<string>;
  /** The secondary recipients of the email, separated by comma (,) */
  CC?: ConnectorValue<string>;
  /** The importance of the mail */
  Importance?: ConnectorValue<string>;
  /** The email addresses to use when replying, separated by comma (,) */
  ReplyTo?: ConnectorValue<string>;
  /** The subject of the email */
  Subject?: ConnectorValue<string>;
  /** The primary recipients of the email, separated by comma (,) */
  To: ConnectorValue<string>;
  /** The attachment to be sent with the email */
  file?: ConnectorValue<string>;
  /** Send an email message. By default, the email will be saved as draft. */
  SaveAsDraft?: ConnectorValue<boolean>;
}

export interface SendEmailOutputs {
  /** The importance of the mail */
  Importance?: string;
  id?: string;
  labelIds?: Array<string>;
  threadId?: string;
}

/** Send Email — uipath.connector.uipath-google-gmail.send-email */
export const SendEmail = descriptor<SendEmailInputs, SendEmailOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.send-email",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface TurnOffAutomaticRepliesInputs {
}

export interface TurnOffAutomaticRepliesOutputs {
  /** The subject line used in automatic reply emails. */
  responseSubject?: string;
  /** Indicates if automatic replies are currently enabled. */
  enableAutoReply?: boolean;
  /** Limits automatic replies to only your contacts. */
  restrictToContacts?: boolean;
  /** Limits automatic replies to recipients within your domain. */
  restrictToDomain?: boolean;
}

/** Turn off Automatic Replies — uipath.connector.uipath-google-gmail.turn-off-automatic-replies */
export const TurnOffAutomaticReplies = descriptor<TurnOffAutomaticRepliesInputs, TurnOffAutomaticRepliesOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.turn-off-automatic-replies",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface TurnOnAutomaticRepliesInputs {
  /** Insert the automatic replies message to be sent inside your organization. If the field is empty the message set in Gmail settings is going to be used */
  responseBodyPlainText?: ConnectorValue<string>;
  /** The mail message subject used to be sent */
  responseSubject: ConnectorValue<string>;
  /** Set if the automatic replies for users outside the organization can be sent only to contacts */
  restrictToContacts?: ConnectorValue<boolean>;
  /** Select when the Out of Office to be turned on. If the field is empty the Out of Office setting will be turned on immediately */
  startTime?: ConnectorValue<string>;
  /** Select when the Out of Office to be turned off. If the field is empty the Out of Office setting will be indefinitely */
  endTime?: ConnectorValue<string>;
  /** Set if the automatic replies can be sent outside user organization */
  sendRepliesOutsideDomain?: ConnectorValue<boolean>;
}

export interface TurnOnAutomaticRepliesOutputs {
  /** Insert the automatic replies message to be sent inside your organization. If the field is empty the message set in Gmail settings is going to be used */
  responseBodyPlainText?: string;
  /** The mail message subject used to be sent */
  responseSubject?: string;
  /** Toggle to turn the automatic reply feature on or off. */
  enableAutoReply?: boolean;
  /** Set if the automatic replies for users outside the organization can be sent only to contacts */
  restrictToContacts?: boolean;
  /** Select when the Out of Office to be turned on. If the field is empty the Out of Office setting will be turned on immediately */
  startTime?: string;
  /** Select when the Out of Office to be turned off. If the field is empty the Out of Office setting will be indefinitely */
  endTime?: string;
  /** Set if the automatic replies can be sent outside user organization */
  restrictToDomain?: boolean;
}

/** Turn on Automatic Replies — uipath.connector.uipath-google-gmail.turn-on-automatic-replies */
export const TurnOnAutomaticReplies = descriptor<TurnOnAutomaticRepliesInputs, TurnOnAutomaticRepliesOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.turn-on-automatic-replies",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
} as const);

export interface UpdateEventCalendarEventInputs {
  /** Indicates if event takes place all day. This supersedes the Start and End time of the event. If left blank, the existing value will not be updated */
  AllDayEvent?: ConnectorValue<boolean>;
  CanInviteOthers?: ConnectorValue<boolean>;
  CanModifyEvent?: ConnectorValue<boolean>;
  CanSeeAttendeesList?: ConnectorValue<boolean>;
  Description?: ConnectorValue<string>;
  /** The new date and time for the end of the event. If left blank, the existing value will not be updated */
  EndDateTime?: ConnectorValue<string>;
  /** The new name of the event. If left blank, the existing value will not be updated */
  EventTitle?: ConnectorValue<string>;
  Location?: ConnectorValue<string>;
  OptionalAttendees?: ConnectorValue<string>;
  OutputEventTimezone?: ConnectorValue<string>;
  RequiredAttendees?: ConnectorValue<string>;
  ResourceAttendees?: ConnectorValue<string>;
  /** Show as */
  ShowAs?: ConnectorValue<string>;
  /** The new date and time for the start of the event. If left blank, the existing value will not be updated */
  StartDateTime?: ConnectorValue<string>;
  /** The new timezone for the event. If left blank, the existing value will not be updated */
  Timezone?: ConnectorValue<string>;
  /** Visibility of the event. */
  Visibility?: ConnectorValue<string>;
  /** Update the required attended via one of the given option */
  changeRequiredAttendees?: ConnectorValue<string>;
  /** Update the optional attended via one of the given option */
  changeOptionalAttendees?: ConnectorValue<string>;
  /** Update the resource attended via one of the given option */
  changeResourceAttendees?: ConnectorValue<string>;
  /** Comma separated list of emails indicating the required attendees to be added */
  addRequiredAttendees?: ConnectorValue<string>;
  /** Comma separated list of emails indicating the required attendees to be removed */
  removeRequiredAttendees?: ConnectorValue<string>;
  /** Comma separated list of emails indicating the optional attendees to be added */
  addOptionalAttendees?: ConnectorValue<string>;
  /** Comma separated list of emails indicating the optional attendees to be removed */
  removeOptionalAttendees?: ConnectorValue<string>;
  /** Comma separated list of emails indicating the resource attendees to be added */
  addResourceAttendees?: ConnectorValue<string>;
  /** Comma separated list of emails indicating the resource attendees to be removed */
  removeResourceAttendees?: ConnectorValue<string>;
  /** Calendar for event. LOOKUP — sends a `CuratedCalendarList.ID`, never a name or e-mail: lookup(<Descriptor>, 'Calendar') (helpers in the LOOKUP lines above the descriptor). */
  Calendar?: ConnectorLookupValue<string>;
  /** Timezone for output event */
  outputTimezone?: ConnectorValue<string>;
  /** If adding conference data is allowed or not. */
  AddConferenceData?: ConnectorValue<boolean>;
  /** The event to update */
  id: ConnectorValue<string>;
  /**
   * Whether to send notifications about the creation of the new event. Note that some emails might still be sent. The default is false.
   *
   * Valid values: all, externalOnly, none
   */
  SendNotifications?: ConnectorValue<string>;
}

export interface UpdateEventCalendarEventOutputs {
  /** Show as */
  ShowAs?: string;
  /** Visibility of the event. */
  Visibility?: string;
  created?: string;
  creator?: Creator;
  end?: End;
  etag?: string;
  eventType?: string;
  htmlLink?: string;
  iCalUID?: string;
  id?: string;
  kind?: string;
  organizer?: Organizer;
  reminders?: Reminders;
  sequence?: number;
  start?: Start;
  status?: string;
  summary?: string;
  updated?: string;
}

/**
 * Update Event (Calendar Event) — uipath.connector.uipath-google-gmail.update-event-calendar-event-
 *
 * LOOKUP: `Calendar` -> CuratedCalendarList.ID
 *   by: `FullName`
 *   use: lookup(UpdateEventCalendarEvent, 'Calendar').byFullName(value)
 *   also: .byFullName  ·  .by(name, value)
 *   strategy: hierarchical walk (the collection is a tree)
 */
export const UpdateEventCalendarEvent = descriptor<UpdateEventCalendarEventInputs, UpdateEventCalendarEventOutputs>()({
  nodeType: "uipath.connector.uipath-google-gmail.update-event-calendar-event-",
  version: "1.0.0",
  requiresConnection: true,
  requiresFolderKey: true,
  lookups: {
    Calendar: {
      objectName: "CuratedCalendarList",
      path: "/CuratedCalendarList",
      by: ["FullName"],
      value: "ID",
      aliases: { byFullName: "FullName" },
      strategy: "tree",
    },
  },
} as const);
