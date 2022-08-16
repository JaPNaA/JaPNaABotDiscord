"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const ellipsisize_js_1 = __importDefault(require("../main/utils/str/ellipsisize.js"));
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
const getSnowflakeNum_js_1 = __importDefault(require("../main/utils/getSnowflakeNum.js"));
const fakeMessage_js_1 = __importDefault(require("../main/utils/fakeMessage.js"));
const mention_js_1 = __importDefault(require("../main/utils/str/mention.js"));
/**
 * Autothread plugin; automatically makes threads
 */
class AutoThread extends plugin_js_1.default {
    userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Automatically create threads and other side effects?",
            default: false
        },
        cooldownTime: {
            type: "number",
            comment: "How many seconds until another thread is created?",
            default: 30
        },
        disableChatCooldown: {
            type: "boolean",
            comment: "Automatically disable chatting while on cooldown?",
            default: true
        },
        noThreadKeyword: {
            type: "string",
            comment: "Will not make a thread if this keyword is found. Empty string to disable",
            default: "[no thread]"
        },
        deleteEmptyThreads: {
            type: "boolean",
            comment: "Deletes automatic threads if they're automatically archived with no messages.",
            default: false
        },
        threadCommands: {
            type: "boolean",
            comment: "Should run commands in a new thread?",
            default: true
        },
        autothreadSubscribers: {
            type: "object",
            comment: "The userId of people to add to autothreads",
            default: []
        }
    };
    cooldowns = new Map();
    cooldownCancelFuncs = [];
    _threadUpdateHandler;
    constructor(bot) {
        super(bot);
        this.pluginName = "autothread";
    }
    async toggleAutothread(event) {
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            this.bot.client.send(event.channelId, "Cannot create threads inside threads.");
            return;
        }
        const isEnabled = await this.config.getInChannel(event.channelId, "enabled");
        if (isEnabled) {
            this.config.setInChannel(event.channelId, "enabled", false);
            this.bot.client.send(event.channelId, "Autothread disabled.");
        }
        else {
            this.config.setInChannel(event.channelId, "enabled", true);
            this.bot.client.send(event.channelId, "Autothread enabled.");
        }
    }
    async archiveThreads(event) {
        const channel = await this.bot.client.getChannel(event.channelId);
        if (channel && channel.isText() && 'threads' in channel) {
            channel.threads.cache.forEach(thread => {
                if (!thread.archived) {
                    thread.setArchived();
                }
            });
        }
    }
    async messageHandler(event, eventControls) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) {
            return;
        }
        if (!(await this._isUserMessage(event))) {
            return;
        }
        const noThreadKeyword = config.get("noThreadKeyword");
        if (noThreadKeyword && event.message.includes(noThreadKeyword)) {
            return;
        }
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            return;
        }
        if (!this.isCool(event.channelId)) {
            return;
        }
        // if is command
        if (event.precommandName) {
            // cancel if don't thread commands
            if (!config.get("threadCommands")) {
                return;
            }
            // cancel if is `!autothread`
            if (event.message.slice(event.precommandName.name.length).toLowerCase().startsWith("autothread")) {
                return;
            }
        }
        // create thread
        const thread = await channel.threads.create({
            name: (0, ellipsisize_js_1.default)(await this.extractTitleFromMessage(event.message) || "Untitled", 100),
            startMessage: event.messageId
        });
        // sets cooldowns
        const cooldownTime = config.get("cooldownTime") * 1000;
        const disableChatCooldown = config.get("disableChatCooldown");
        this.setCooldown(event.channelId, cooldownTime);
        if (disableChatCooldown) {
            // prevent people from sending messages while on cooldown
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false });
            this.addCooldownDoneTimeout(() => channel.permissionOverwrites.delete(channel.guild.roles.everyone), cooldownTime);
        }
        // if the bot responds to the message (ex. command), respond in thread
        eventControls.preventSystemNext();
        eventControls.stopPropagation();
        this.bot.rawEventAdapter.onMessage((0, fakeMessage_js_1.default)({
            author: (await this.bot.client.getUser(event.userId)),
            channel: thread,
            content: event.message,
            guild: (await this.bot.client.getServer(event.serverId)),
            id: event.messageId
        }));
        // add thread subscribers
        const subscribers = config.get("autothreadSubscribers");
        if (Array.isArray(subscribers) && subscribers.length > 0) {
            const subscribersToNotice = subscribers.filter(id => id !== event.userId);
            if (subscribersToNotice.length > 0) {
                const message = await thread.send("(Adding subscribers...)");
                const messageText = thread.name + ": subscribed\n" +
                    subscribersToNotice
                        .map(id => (0, mention_js_1.default)(id))
                        .join(" ");
                await message.edit(messageText);
                await message.delete();
            }
        }
    }
    async _onThreadUpdate(oldState, newState) {
        const config = await this.config.getAllUserSettingsInChannel(newState.id);
        if (!config.get("deleteEmptyThreads")) {
            return;
        } // ignore; don't delete threads
        if (oldState.ownerId !== this.bot.client.id) {
            return;
        } // ignore; thread not made by bot (UNTESTED)
        if (oldState.archived || !newState.archived) {
            return;
        } // ignore; not change to archive
        if (oldState.archiveTimestamp === null || oldState.autoArchiveDuration === null) {
            return;
        } // lack of information
        const autoArchiveTimestamp = oldState.archiveTimestamp + oldState.autoArchiveDuration * 60e3;
        if (Date.now() < autoArchiveTimestamp) {
            return;
        } // ignore; manual archive
        let messageCacheSize = newState.messages.cache.size;
        if (messageCacheSize === 1) {
            const firstMessage = newState.messages.cache.at(0);
            if (firstMessage && firstMessage.type === "THREAD_STARTER_MESSAGE") {
                messageCacheSize -= 1; // first message is not message
            }
        }
        if (messageCacheSize > 0 ||
            newState.messageCount === null ||
            newState.messageCount > 0) {
            return;
        } // ignore; contains or has chance to contain messages
        await newState.delete();
    }
    addCooldownDoneTimeout(func, cooldownTime) {
        const timeout = setTimeout(() => {
            func();
        }, cooldownTime);
        const cancelFunc = () => {
            clearTimeout(timeout);
            func();
            this.cooldownCancelFuncs.splice(this.cooldownCancelFuncs.indexOf(cancelFunc), 1);
        };
        this.cooldownCancelFuncs.push(cancelFunc);
    }
    async extractTitleFromMessage(message) {
        const firstLine = message
            .replace(/[_\*]/g, "") // remove formatting characters
            .replace(/\|\|.+?\|\|/g, "(...)") // remove spoiler text
            .split("\n").find(e => e.trim());
        // back out of extraction
        if (!firstLine) {
            return message;
        }
        // already short enough -- no need for further extraction
        if (firstLine.length < 25) {
            return firstLine;
        }
        const extractedTitle = (await this.unMentionify(firstLine)) // swap <@###> -> @username
            .split(/\s+/)
            .filter(e => !STOP_WORDS.has(// remove stop words
        e.replace(/\W/g, "").toLowerCase())).join(" ");
        // extracted nothing, back out
        if (extractedTitle.length === 0) {
            return firstLine;
        }
        return extractedTitle;
    }
    async unMentionify(str) {
        const regex = /<@[!@&]?\d+>/g;
        let strParts = [];
        let lastIndex = 0;
        for (let match; match = regex.exec(str);) {
            const snowflake = (0, getSnowflakeNum_js_1.default)(match[0]);
            if (!snowflake) {
                continue;
            }
            const user = await this.bot.client.getUser(snowflake);
            if (!user) {
                continue;
            }
            strParts.push(str.slice(lastIndex, match.index));
            strParts.push("@" + user.username);
            lastIndex = match.index + match[0].length;
        }
        return strParts.join("") + str.slice(lastIndex);
    }
    async _isUserMessage(event) {
        const user = await this.bot.client.getUser(event.userId);
        return Boolean(user && !user.bot);
    }
    isCool(channelId) {
        const cooldown = this.cooldowns.get(channelId);
        return !cooldown || cooldown <= Date.now();
    }
    setCooldown(channelId, time) {
        this.cooldowns.set(channelId, Date.now() + time);
    }
    _start() {
        this.bot.client.client.on("threadUpdate", this._threadUpdateHandler = (oldState, newState) => {
            this._onThreadUpdate(oldState, newState)
                .catch(err => logger_js_1.default.error(err));
        });
        this._registerDefaultCommand("autothread", this.toggleAutothread, {
            group: "Communication",
            help: {
                description: "Enables autothread (making threads) for the channel.",
                examples: [
                    ["autothread", "Toggles autothread on the channel"]
                ]
            },
            noDM: true
        });
        this._registerDefaultCommand("archive threads", this.archiveThreads, {
            group: "Communication",
            help: {
                description: "Archives all active threads in the channel."
            },
            noDM: true,
            requiredDiscordPermission: "MANAGE_THREADS"
        });
        this.bot.events.message.addHighPriorityHandler(this.messageHandler.bind(this));
    }
    _stop() {
        if (this._threadUpdateHandler) {
            this.bot.client.client.off("threadUpdate", this._threadUpdateHandler);
        }
        while (this.cooldownCancelFuncs.length > 0) {
            this.cooldownCancelFuncs[this.cooldownCancelFuncs.length - 1]();
        }
    }
}
exports.default = AutoThread;
const STOP_WORDS = new Set(`i
me
my
myself
we
our
ours
ourselves
you
your
yours
yourself
yourselves
he
him
his
himself
she
her
hers
herself
it
its
itself
they
them
their
theirs
themselves
what
which
who
whom
this
that
these
those
am
is
are
was
were
be
been
being
have
has
had
having
do
does
did
doing
a
an
the
and
but
if
or
because
as
until
while
of
at
by
for
with
about
against
between
into
through
during
before
after
above
below
to
from
up
down
in
out
on
off
over
under
again
further
then
once
here
there
when
where
why
how
all
any
both
each
few
more
most
other
some
such
no
nor
not
only
own
same
so
than
too
very
s
t
can
will
just
don
should
now
literally
bruh
lol`.split("\n"));
