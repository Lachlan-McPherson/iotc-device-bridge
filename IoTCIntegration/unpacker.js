function GPS_unpack(data_count, packet) {
    const data = Buffer.from(packet, "hex");
    msg_type = data.readUInt8(0);
    gps_time_0 = data.readInt32LE(1);
    data_diag = data.readUInt8(5);
    lat_0 = Math.round( ( data.readUIntBE(6, 3)/ 0xFFFFFF * 180 - 90 )*10000000 ) / 10000000;
    lon_0 = Math.round( ( data.readUIntBE(9, 3)/ 0xFFFFFF * 360 - 180 )*10000000 ) / 10000000;
    gps_time_1 = data.readInt16LE(12);
    lat_1 = Math.round( ( data.readUIntBE(14, 3)/ 0xFFFFFF * 180 - 90 )*10000000 ) / 10000000;
    lon_1 = Math.round( ( data.readUIntBE(17, 3)/ 0xFFFFFF * 360 - 180 )*10000000 ) / 10000000;
    if (data_count == 1)
    {
        return {
            "Message Type": "GPS Message",
            "Data Count": data_count,
            "GPS Data 1 Latitude": lat_0,
            "GPS Data 1 Longitude": lon_0,
            "GPS Data 1 Time": new Date(gps_time_0*1000).toJSON()
        }
    }
    if (data_count > 1)
    {
        return {
            "Message Type": "GPS Message",
            "Data Count": data_count,
            "GPS Data 1 Latitude": lat_0,
            "GPS Data 1 Longitude": lon_0,
            "GPS Data 1 Time": new Date(gps_time_0*1000).toJSON(),
            "GPS Data 2 Latitude": lat_1,
            "GPS Data 2 Longitude": lon_1,
            "GPS Data 2 Time": new Date((gps_time_0 + gps_time_1)*1000).toJSON()
        }
    }
}

function sensor_unpack(data_count, packet) {
    const data = Buffer.from(packet, "hex");
    msg_type = data.readUInt8(0);
    time0 = data.readInt32LE(1)*1000;
    data_diag = data.readUInt8(5);
    current0 = data.readUInt16LE(6);
    time1 = data.readUInt16LE(8)*1000;
    current1 = data.readUInt16LE(10);
    time2 = data.readUInt16LE(12)*1000;
    current2 = data.readUInt16LE(14);
    time3 = data.readUInt16LE(16)*1000;
    current3 = data.readUInt16LE(18);
    values = {"Message Type": "Sensor Message", "Data Count": data_count,'Sensor Data 1 Time': new Date(time0).toJSON(), 'Sensor Data 1 Current (uA)': current0}
    if (data_count>1)
    {
        values['Sensor Data 2 Time'] = new Date(time1 + time0).toJSON();
        values['Sensor Data 2 Current (uA)'] =current1;
        if (data_count>2)
        {
            values['Sensor Data 3 Time'] = new Date(time2 + time1 + time0).toJSON();;
            values['Sensor Data 3 Current (uA)'] =current2;
            
        }
        if (data_count>3)
            {
                values['Sensor Data 4 Time'] = new Date(time3 + time2 + time1 + time0).toJSON();;
                values['Sensor Data 4 Current (uA)'] =current3;
                
            }
    }

    return values;
}

function management_unpack(packet) {
    const data = Buffer.from(packet, "hex")
    const data_as_Uint8 = new Uint8Array(data);
    msg_type = data_as_Uint8[0];
    msg_time = data.readInt32LE(1);
    seq = data.readInt16LE(5);
    errn = data.readInt16LE(7);
    lat = Math.round( ( data.readUIntBE(9, 3)/ 0xFFFFFF * 180 - 90 )*10000000 ) / 10000000;
    lon = Math.round( ( data.readUIntBE(12,3)/ 0xFFFFFF * 360 - 180 )*10000000 ) / 10000000;
    msgc = data.readInt16LE(15);
    batv = Math.round((data_as_Uint8[17] * 1e-1)*10)/10;
    temp = data.readInt16LE(18);
    return {
        "Message Type": "Management Message",
        "Message Time": new Date(msg_time*1000).toJSON(),
        "Number of Readings": seq,
        "Number of Errors": errn,
        "Latitude": lat,
        "Longitude": lon,
        "User Message Count": msgc,
        "Battery Voltage (V)": batv,
        "Temperature (deg C)": temp,
    }
     
}


module.exports = function(packet) {
    const data = Buffer.from(packet, "hex")
    //determining message type
    type = data.readUInt8(0)
    if (type == 2)
    {
        return management_unpack(packet);
    } else {
        const data_type = (data.readUInt8(5) & 0xF0)/16;
        const data_count = data.readUInt8(5) & 0xF;
        if (data_type == 1)
        {
            return GPS_unpack(data_count, packet)
        } else {
            return sensor_unpack(data_count, packet)
        }

    }

}
