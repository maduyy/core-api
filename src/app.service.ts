import { Injectable } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as amqp from 'amqp-connection-manager'
import * as amqplib from 'amqplib'
import { ScansService } from './scans/scans.service'

@Injectable()
export class AppService {
    constructor(
        private configService: ConfigService,
        private readonly scansService: ScansService,
    ) {}

    scan() {
        Logger.error('Ini ceritanya apa hayo hehehehehehe', 'OtaknyaError')
        Logger.error('Yahaha wahyu', 'OtaknyaError')

        const queue = this.configService.get<string>('RMQ_QUEUE')
        const connection = amqp.connect([
            this.configService.get<string>('RMQ_URL'),
        ])

        const channel = connection.createChannel({
            json: true,
            setup: (channel: amqplib.ConfirmChannel) =>
                channel.assertQueue(queue, { durable: true }),
        })

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                Logger.log('Dari RMQ gan: ' + msg.content.toString())
                channel.ack(msg)
                const { mac, rf_id } = JSON.parse(msg.content.toString())
                this.scansService.scan(mac, rf_id.trim())
            } else {
                Logger.warn('Consumer cancelled by server')
            }
        })
    }
}
