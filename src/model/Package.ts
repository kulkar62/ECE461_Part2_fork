import {Schema, model, ObjectId} from 'mongoose';


interface IPackage {
    Name: string;
    Version: string;
    ID: string;
    Content: string;
    URL: string;
    JSProgram: string;
    NetScore: Number;
    PullRequestMetric: Number;
    DependencyMetric: Number;
    RampUpScore: Number;
    CorrectnessScore: Number;
    BusFactorScore: Number;
    RespScore: Number;
    LicenseScore: Number;

}

const packageSchema = new Schema<IPackage>({

    Name: {
        type: String,
        required: true
    },
    Version: {
        type: String,
        required: true
    },
    ID: {
        type: String,
        required: true
    },
    Content: {
        type: String,
        required: false
    },
    URL: {
        type: String,
        required: false
    },
    JSProgram: {
        type: String,
        required: false
    },
    NetScore: {
        type: Number,
        required: true
    },
    PullRequestMetric: {
        type: Number,
        required: true
    },
    DependencyMetric: {
        type: Number,
        required: true
    },
    RampUpScore: {
        type: Number,
        required: true
    },
    CorrectnessScore: {
        type: Number,
        required: true
    },
    BusFactorScore: {
        type: Number,
        required: true
    },
    RespScore: {
        type: Number,
        required: true
    },
    LicenseScore: {
        type: Number,
        required: true
    },

});

export default model<IPackage>('Package', packageSchema);


// import mongoose, { Schema, Document, model } from 'mongoose';
// import { PackageMetadata } from './PackageMetadata';
// import { PackageData } from './PackageData';

// interface Package extends Document {
//     packageMetadata: PackageMetadata;
//     packageData: PackageData;
// }

// const packageSchema = new Schema<Package>({
//     packageMetadata: { type: Schema.Types.ObjectId, ref: 'PackageMetadata', required: true },
//     packageData: { type: Schema.Types.ObjectId, ref: 'PackageData', required: true },
// });

// export default model<Package>('Package', packageSchema);
